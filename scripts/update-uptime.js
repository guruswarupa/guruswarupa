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

const uptime = `${years} years, ${months} months, ${days} days`;

let readme = fs.readFileSync("README.md", "utf8");

readme = readme.replace(
    /<!--UPTIME_START-->[\s\S]*<!--UPTIME_END-->/,
    `<!--UPTIME_START-->\n${uptime}\n<!--UPTIME_END-->`
);

fs.writeFileSync("README.md", readme);
