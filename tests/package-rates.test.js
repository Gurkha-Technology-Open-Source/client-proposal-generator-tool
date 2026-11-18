const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const rates = require("../rates.js");

const root = path.join(__dirname, "..");
const bundled = JSON.parse(fs.readFileSync(path.join(root, "data.json"), "utf8"));
const samplePath = path.join(root, "sample-package-rates.csv");

function pricesOf(data) {
    return data.services.flatMap(service => service.packages.map(pkg => pkg.price));
}

test("sample CSV is generated from data.json and keeps every price", () => {
    const generated = rates.proposalDataToCsv(bundled);
    assert.equal(fs.readFileSync(samplePath, "utf8"), generated);

    const parsed = rates.proposalDataFromCsv(generated);
    assert.equal(parsed.ok, true, parsed.errors && parsed.errors.join("; "));
    assert.deepEqual(parsed.data, rates.validateProposalData(bundled).data);
    assert.deepEqual(pricesOf(parsed.data), pricesOf(bundled));
    assert.equal(parsed.data.services.length, bundled.services.length);
    assert.equal(
        parsed.data.services.reduce((count, service) => count + service.packages.length, 0),
        26
    );
});

test("quoted commas, quotes, and newlines stay inside the field", () => {
    const csv = [
        "service_id,service_name,service_description,package_id,package_name,price,features,full_description",
        'webDev,"Web, Development","Line one\nLine two",starter,"Starter ""Plus""","NRs 35,000","5 pages, SEO","Full, description"'
    ].join("\n");

    const parsed = rates.proposalDataFromCsv(csv);
    assert.equal(parsed.ok, true, parsed.errors && parsed.errors.join("; "));
    const service = parsed.data.services[0];
    assert.equal(service.name, "Web, Development");
    assert.equal(service.description, "Line one\nLine two");
    assert.equal(service.packages[0].name, 'Starter "Plus"');
    assert.equal(service.packages[0].price, "NRs 35,000");
    assert.equal(service.packages[0].features, "5 pages, SEO");
    assert.equal(service.packages[0].fullDescription, "Full, description");
});

test("CRLF, a BOM, and blank rows still parse", () => {
    const csv = "\uFEFF" + rates.proposalDataToCsv(bundled).replace(/\n/g, "\r\n") + "\r\n";
    const parsed = rates.proposalDataFromCsv(csv);
    assert.equal(parsed.ok, true, parsed.errors && parsed.errors.join("; "));
    assert.deepEqual(pricesOf(parsed.data), pricesOf(bundled));
});

test("header names may use spaces", () => {
    const csv = [
        "Service ID,Service Name,Service Description,Package ID,Package Name,Price,Features,Full Description",
        'webDev,Web Development,Builds sites,starter,Starter,"NRs 35,000",Pages,Details'
    ].join("\n");
    const parsed = rates.proposalDataFromCsv(csv);
    assert.equal(parsed.ok, true, parsed.errors && parsed.errors.join("; "));
    assert.equal(parsed.data.services[0].packages[0].price, "NRs 35,000");
});

test("invalid sheets are rejected", () => {
    const header = "service_id,service_name,service_description,package_id,package_name,price,features,full_description";
    const cases = [
        ["empty", ""],
        ["unclosed quote", header + '\nwebDev,"oops,starter,Starter,NRs 1,x,y'],
        ["missing price column", "service_id,service_name,service_description,package_id,package_name,features,full_description\nwebDev,Web,Desc,starter,Starter,Pages,Details"],
        ["blank price", header + "\nwebDev,Web Development,Desc,starter,Starter,,Pages,Details"],
        ["conflicting service name", header + "\nwebDev,Web,Desc,starter,Starter,NRs 1,a,b\nwebDev,Other,Desc,premium,Premium,NRs 2,c,d"],
        ["duplicate package id", header + "\nwebDev,Web,Desc,starter,Starter,NRs 1,a,b\nwebDev,Web,Desc,starter,Other,NRs 2,c,d"],
        ["old matrix sheet", "Services,Package GT 1,Package GT 2\nTotal Cost,\"50,000\",\"75,000\"\n"]
    ];

    cases.forEach(([name, csv]) => {
        const parsed = rates.proposalDataFromCsv(csv);
        assert.equal(parsed.ok, false, name);
    });
});

test("an empty or placeholder URL is treated as unset", () => {
    assert.equal(rates.configuredSheetUrl(""), "");
    assert.equal(rates.configuredSheetUrl("   "), "");
    assert.equal(rates.configuredSheetUrl("not a url"), "");
    assert.equal(rates.configuredSheetUrl("https://docs.google.com/spreadsheets/d/e/PUBLISH_ID/pub?output=csv"), "");
    assert.equal(
        rates.configuredSheetUrl("https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv"),
        "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv"
    );
});

test("source selection falls back without changing a valid sheet", () => {
    const bundledData = rates.validateProposalData(bundled).data;
    const sheetData = {
        services: [{
            id: "webDev",
            name: "Web Development",
            description: "From the sheet",
            packages: [{
                id: "starter",
                name: "Starter",
                price: "NRs 40,000",
                features: "Updated",
                fullDescription: "Updated description"
            }]
        }]
    };

    const unconfigured = rates.resolveRates({ configuredUrl: "", bundled: bundledData, fetched: null, cached: sheetData });
    assert.equal(unconfigured.source, "bundled");
    assert.equal(unconfigured.reason, "unconfigured");
    assert.deepEqual(pricesOf(unconfigured.data), pricesOf(bundledData));

    const live = rates.resolveRates({
        configuredUrl: "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv",
        bundled: bundledData,
        fetched: { ok: true, data: sheetData },
        cached: null
    });
    assert.equal(live.source, "sheet");
    assert.equal(live.data.services[0].packages[0].price, "NRs 40,000");

    const invalid = rates.resolveRates({
        configuredUrl: "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv",
        bundled: bundledData,
        fetched: { ok: false, reason: "invalid" },
        cached: sheetData
    });
    assert.equal(invalid.source, "bundled");
    assert.equal(invalid.reason, "invalid");
    assert.deepEqual(pricesOf(invalid.data), pricesOf(bundledData));

    const cached = rates.resolveRates({
        configuredUrl: "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv",
        bundled: bundledData,
        fetched: { ok: false, reason: "network" },
        cached: sheetData
    });
    assert.equal(cached.source, "cache");
    assert.equal(cached.reason, "unreachable");
    assert.equal(cached.data.services[0].packages[0].price, "NRs 40,000");

    const bundledAfterOutage = rates.resolveRates({
        configuredUrl: "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv",
        bundled: bundledData,
        fetched: { ok: false, reason: "network" },
        cached: null
    });
    assert.equal(bundledAfterOutage.source, "bundled");
    assert.equal(bundledAfterOutage.reason, "unreachable");

    assert.equal(rates.ratesSourceNotice("sheet", "live"), "Using package rates from the Google Sheet.");
    assert.match(rates.ratesSourceNotice("bundled", "unconfigured"), /data\.json/);
    assert.match(rates.ratesSourceNotice("bundled", "invalid"), /invalid/);
    assert.match(rates.ratesSourceNotice("bundled", "unreachable"), /unavailable/);
    assert.match(rates.ratesSourceNotice("cache", "unreachable"), /cached Google Sheet/);
});
