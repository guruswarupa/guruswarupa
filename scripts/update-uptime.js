const fs = require("fs");

const dob = new Date("2005-06-02");
const now = new Date();

let years = now.getFullYear() - dob.getFullYear();
let months = now.getMonth() - dob.getMonth();
let days = now.getDate() - dob.getDate();

if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
}

if (months < 0) {
    years--;
    months += 12;
}

function plural(value, word) {
    return `${value} ${word}${value === 1 ? "" : "s"}`;
}

const uptime = `${plural(years, "year")}, ${plural(months, "month")}, ${plural(days, "day")}`;

// Read README
let readme = fs.readFileSync("README.md", "utf8");

// Replace placeholder
readme = readme.replace(
    /(Uptime:\.*\s).*/,
    `$1${uptime}`
);

// Write updated README
fs.writeFileSync("README.md", readme);
