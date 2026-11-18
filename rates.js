// Parse a published Google Sheet CSV into the data.json package shape.
// Loaded as a classic script in the browser and as a CommonJS module in tests.
(function (root, factory) {
    const api = factory();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
    root.PackageRates = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    const COLUMNS = [
        "service_id",
        "service_name",
        "service_description",
        "package_id",
        "package_name",
        "price",
        "features",
        "full_description"
    ];

    const HEADER_ALIASES = {
        service_id: "service_id",
        serviceid: "service_id",
        service_name: "service_name",
        servicename: "service_name",
        service_description: "service_description",
        servicedescription: "service_description",
        description: "service_description",
        package_id: "package_id",
        packageid: "package_id",
        package_name: "package_name",
        packagename: "package_name",
        price: "price",
        package_price: "price",
        cost: "price",
        features: "features",
        feature: "features",
        package_features: "features",
        full_description: "full_description",
        fulldescription: "full_description",
        package_description: "full_description",
        package_full_description: "full_description"
    };

    function configuredSheetUrl(value) {
        if (typeof value !== "string") return "";
        const url = value.trim();
        if (!url) return "";
        if (!/^https?:\/\//i.test(url)) return "";
        if (/PUBLISH_ID|YOUR_|PASTE_|<|>|example\.com/i.test(url)) return "";
        return url;
    }

    function withCacheBuster(url) {
        const separator = url.indexOf("?") === -1 ? "?" : "&";
        return url + separator + "_=" + Date.now();
    }

    function normalizeHeader(header) {
        return String(header || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
    }

    function parseCsv(text) {
        if (typeof text !== "string") {
            return { ok: false, error: "CSV was empty." };
        }
        let csv = text;
        if (csv.charCodeAt(0) === 0xFEFF) csv = csv.slice(1);
        if (csv.trim() === "") {
            return { ok: false, error: "CSV was empty." };
        }

        const rows = [];
        let row = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            if (inQuotes) {
                if (char === '"') {
                    if (csv[i + 1] === '"') {
                        field += '"';
                        i += 1;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field += char;
                }
                continue;
            }

            if (char === '"') {
                if (field === "") {
                    inQuotes = true;
                } else {
                    field += char;
                }
                continue;
            }
            if (char === ",") {
                row.push(field);
                field = "";
                continue;
            }
            if (char === "\n" || char === "\r") {
                if (char === "\r" && csv[i + 1] === "\n") i += 1;
                row.push(field);
                rows.push(row);
                row = [];
                field = "";
                continue;
            }
            field += char;
        }

        if (inQuotes) {
            return { ok: false, error: "CSV has an unclosed quote." };
        }
        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

        return { ok: true, rows: rows };
    }

    function mapHeaders(headerRow) {
        const indexByColumn = {};
        const errors = [];

        headerRow.forEach(function (header, index) {
            const canonical = HEADER_ALIASES[normalizeHeader(header)];
            if (!canonical) return;
            if (Object.prototype.hasOwnProperty.call(indexByColumn, canonical)) {
                errors.push('Duplicate column "' + canonical + '".');
                return;
            }
            indexByColumn[canonical] = index;
        });

        COLUMNS.forEach(function (column) {
            if (!Object.prototype.hasOwnProperty.call(indexByColumn, column)) {
                errors.push('Missing column "' + column + '".');
            }
        });

        if (errors.length) return { ok: false, errors: errors };
        return { ok: true, indexByColumn: indexByColumn };
    }

    function cell(row, index) {
        if (index == null || index >= row.length || row[index] == null) return "";
        return String(row[index]).trim();
    }

    function validateProposalData(input) {
        const errors = [];
        if (!input || typeof input !== "object" || !Array.isArray(input.services)) {
            return { ok: false, errors: ["Package data must be an object with a services array."] };
        }
        if (input.services.length === 0) {
            return { ok: false, errors: ["Package data has no services."] };
        }

        const services = [];
        const seenServices = new Set();

        input.services.forEach(function (service, serviceIndex) {
            const label = "Service " + (serviceIndex + 1);
            if (!service || typeof service !== "object") {
                errors.push(label + " is not an object.");
                return;
            }
            const id = cell([service.id], 0);
            const name = cell([service.name], 0);
            const description = service.description == null ? "" : String(service.description).trim();
            if (!id) errors.push(label + ' is missing "id".');
            if (!name) errors.push(label + ' is missing "name".');
            if (id && seenServices.has(id)) errors.push('Duplicate service id "' + id + '".');
            if (id) seenServices.add(id);
            if (!Array.isArray(service.packages) || service.packages.length === 0) {
                errors.push(label + " has no packages.");
                return;
            }

            const packages = [];
            const seenPackages = new Set();
            service.packages.forEach(function (pkg, packageIndex) {
                const pkgLabel = label + " package " + (packageIndex + 1);
                if (!pkg || typeof pkg !== "object") {
                    errors.push(pkgLabel + " is not an object.");
                    return;
                }
                const packageId = cell([pkg.id], 0);
                const packageName = cell([pkg.name], 0);
                const price = cell([pkg.price], 0);
                const features = pkg.features == null ? "" : String(pkg.features).trim();
                const fullDescription = pkg.fullDescription == null ? "" : String(pkg.fullDescription).trim();
                if (!packageId) errors.push(pkgLabel + ' is missing "id".');
                if (!packageName) errors.push(pkgLabel + ' is missing "name".');
                if (!price) errors.push(pkgLabel + ' is missing "price".');
                if (packageId && seenPackages.has(packageId)) {
                    errors.push('Duplicate package id "' + packageId + '" in service "' + id + '".');
                }
                if (packageId) seenPackages.add(packageId);
                packages.push({
                    id: packageId,
                    name: packageName,
                    price: price,
                    features: features,
                    fullDescription: fullDescription
                });
            });

            services.push({
                id: id,
                name: name,
                description: description,
                packages: packages
            });
        });

        if (errors.length) return { ok: false, errors: errors };
        return { ok: true, data: { services: services }, errors: [] };
    }

    function proposalDataFromCsv(text) {
        const parsed = parseCsv(text);
        if (!parsed.ok) return { ok: false, errors: [parsed.error] };

        const rows = parsed.rows.filter(function (row) {
            return row.some(function (value) {
                return String(value).trim() !== "";
            });
        });
        if (rows.length < 2) {
            return { ok: false, errors: ["CSV needs a header row and at least one package row."] };
        }

        const mapped = mapHeaders(rows[0]);
        if (!mapped.ok) return { ok: false, errors: mapped.errors };

        const columns = mapped.indexByColumn;
        const headerCount = rows[0].length;
        const services = [];
        const byId = new Map();
        const errors = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 1;
            if (row.length > headerCount) {
                errors.push("Row " + rowNumber + " has more columns than the header. Quote fields that contain commas.");
                continue;
            }

            const serviceId = cell(row, columns.service_id);
            const serviceName = cell(row, columns.service_name);
            const serviceDescription = cell(row, columns.service_description);
            const packageId = cell(row, columns.package_id);
            const packageName = cell(row, columns.package_name);
            const price = cell(row, columns.price);
            const features = cell(row, columns.features);
            const fullDescription = cell(row, columns.full_description);

            if (!serviceId || !serviceName || !packageId || !packageName || !price) {
                errors.push("Row " + rowNumber + " needs service_id, service_name, package_id, package_name, and price.");
                continue;
            }

            let service = byId.get(serviceId);
            if (!service) {
                service = {
                    id: serviceId,
                    name: serviceName,
                    description: serviceDescription,
                    packages: []
                };
                byId.set(serviceId, service);
                services.push(service);
            } else {
                if (service.name !== serviceName) {
                    errors.push('Row ' + rowNumber + ' gives service "' + serviceId + '" a different service_name.');
                }
                if (serviceDescription && service.description && serviceDescription !== service.description) {
                    errors.push('Row ' + rowNumber + ' gives service "' + serviceId + '" a different service_description.');
                } else if (serviceDescription && !service.description) {
                    service.description = serviceDescription;
                }
            }

            service.packages.push({
                id: packageId,
                name: packageName,
                price: price,
                features: features,
                fullDescription: fullDescription
            });
        }

        if (errors.length) return { ok: false, errors: errors.slice(0, 12) };

        const validated = validateProposalData({ services: services });
        if (!validated.ok) return validated;
        return { ok: true, data: validated.data, errors: [] };
    }

    function escapeCsv(value) {
        const text = value == null ? "" : String(value);
        if (/[",\r\n]/.test(text)) {
            return '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
    }

    function proposalDataToCsv(data) {
        const lines = [COLUMNS.join(",")];
        (data.services || []).forEach(function (service) {
            (service.packages || []).forEach(function (pkg) {
                lines.push([
                    service.id,
                    service.name,
                    service.description,
                    pkg.id,
                    pkg.name,
                    pkg.price,
                    pkg.features,
                    pkg.fullDescription
                ].map(escapeCsv).join(","));
            });
        });
        return lines.join("\n") + "\n";
    }

    function resolveRates(input) {
        const source = input || {};
        const url = configuredSheetUrl(source.configuredUrl);
        const bundled = validateProposalData(source.bundled);
        const cached = validateProposalData(source.cached);
        const bundledData = bundled.ok ? bundled.data : null;
        const cachedData = cached.ok ? cached.data : null;

        if (!url) {
            if (bundledData) return { ok: true, data: bundledData, source: "bundled", reason: "unconfigured" };
            return { ok: false, data: null, source: "none", reason: "unconfigured" };
        }

        const fetched = source.fetched;
        if (fetched && fetched.ok) {
            const live = validateProposalData(fetched.data);
            if (live.ok) return { ok: true, data: live.data, source: "sheet", reason: "live" };
        }

        const reason = fetched && fetched.reason === "invalid" ? "invalid" : "unreachable";
        if (reason === "unreachable" && cachedData) {
            return { ok: true, data: cachedData, source: "cache", reason: "unreachable" };
        }
        if (bundledData) return { ok: true, data: bundledData, source: "bundled", reason: reason };
        if (cachedData) return { ok: true, data: cachedData, source: "cache", reason: reason };
        return { ok: false, data: null, source: "none", reason: reason };
    }

    function ratesSourceNotice(source, reason) {
        if (source === "sheet") return "Using package rates from the Google Sheet.";
        if (source === "cache") return "Using cached Google Sheet rates (live sheet unavailable).";
        if (reason === "invalid") return "Using bundled package rates (Google Sheet data was invalid).";
        if (reason === "unreachable") return "Using bundled package rates (Google Sheet unavailable).";
        return "Using bundled package rates (data.json).";
    }

    return {
        COLUMNS: COLUMNS,
        configuredSheetUrl: configuredSheetUrl,
        withCacheBuster: withCacheBuster,
        parseCsv: parseCsv,
        proposalDataFromCsv: proposalDataFromCsv,
        proposalDataToCsv: proposalDataToCsv,
        validateProposalData: validateProposalData,
        resolveRates: resolveRates,
        ratesSourceNotice: ratesSourceNotice
    };
});
