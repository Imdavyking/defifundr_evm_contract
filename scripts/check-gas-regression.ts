import * as fs from 'fs';
import * as path from 'path';

// Configuration
const BASELINE_FILE = path.join(__dirname, '../gas-baseline.json');
const GAS_REPORT_FILE = path.join(__dirname, '../gas-report.txt');
const REGRESSION_THRESHOLD = 5; // Percentage threshold for regression

interface GasData {
    [method: string]: number;
}

// Simple function to parse the gas report
function parseGasReport(): GasData {
    if (!fs.existsSync(GAS_REPORT_FILE)) {
        console.log("No gas report file found. Run tests with REPORT_GAS=true first.");
        return {};
    }

    const content = fs.readFileSync(GAS_REPORT_FILE, 'utf8');
    const result: GasData = {};

    // Simple regex to extract method names and gas usage
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.includes('·') && line.includes('gas')) {
            const parts = line.split('·').filter(part => part.trim() !== '');
            if (parts.length >= 3) {
                const method = parts[0].trim();
                const gasUsed = parseInt(parts[2].trim().replace(/,/g, ''));
                if (method && !isNaN(gasUsed)) {
                    result[method] = gasUsed;
                }
            }
        }
    }

    return result;
}

// Load the baseline
function loadBaseline(): GasData {
    if (!fs.existsSync(BASELINE_FILE)) {
        return {};
    }

    try {
        const content = fs.readFileSync(BASELINE_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error("Error loading baseline:", error);
        return {};
    }
}

// Save the baseline
function saveBaseline(data: GasData): void {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(data, null, 2));
    console.log("Gas baseline updated");
}

// Main function
function main(): void {
    // Parse the current gas report
    const currentData = parseGasReport();
    if (Object.keys(currentData).length === 0) {
        return;
    }

    // Load the baseline
    const baseline = loadBaseline();

    // Compare with baseline
    console.log("\nGas Usage Report:");
    console.log("================\n");

    let hasRegression = false;

    for (const [method, gas] of Object.entries(currentData)) {
        const baselineGas = baseline[method] || gas;
        const diff = gas - baselineGas;
        const percentChange = ((diff / baselineGas) * 100).toFixed(2);

        const status = diff > 0
            ? `⚠️ INCREASED by ${diff} gas (${percentChange}%)`
            : diff < 0
                ? `✅ DECREASED by ${Math.abs(diff)} gas (${Math.abs(parseFloat(percentChange))}%)`
                : "✓ UNCHANGED";

        console.log(`${method}:`);
        console.log(`  Current: ${gas} gas`);
        console.log(`  Baseline: ${baselineGas} gas`);
        console.log(`  Status: ${status}`);
        console.log("");

        if (diff > 0 && parseFloat(percentChange) > REGRESSION_THRESHOLD) {
            hasRegression = true;
        }
    }

    // Update the baseline (unless in CI on a branch)
    const isCI = process.env.CI === "true";
    const isMainBranch = process.env.GITHUB_REF === "refs/heads/main";

    if (!isCI || isMainBranch) {
        saveBaseline(currentData);
    }

    if (hasRegression) {
        console.log("\n⚠️ Gas usage regression detected!");
        if (isCI && !isMainBranch) {
            process.exit(1);
        }
    } else {
        console.log("\n✅ No significant gas regressions detected");
    }
}

// Run the script
main();