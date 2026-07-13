const fs = require("fs");

const USERNAME = "guruswarupa";
const DOB = new Date("2005-06-02");

function plural(value, word) {
    return `${value} ${word}${value === 1 ? "" : "s"}`;
}

function getUptime() {
    const now = new Date();

    let years = now.getFullYear() - DOB.getFullYear();
    let months = now.getMonth() - DOB.getMonth();
    let days = now.getDate() - DOB.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return `${plural(years, "year")}, ${plural(months, "month")}, ${plural(days, "day")}`;
}

async function getGithubStats() {
    const headers = {
        Authorization: `Bearer ${process.env.TOKEN}`,
        "User-Agent": USERNAME
    };

    const user = await fetch(
        `https://api.github.com/users/${USERNAME}`,
        { headers }
    ).then(r => r.json());

    const repos = await fetch(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
        { headers }
    ).then(r => r.json());

    const stars = repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
    );

    return {
        repos: user.public_repos,
        followers: user.followers,
        stars
    };
}

async function main() {
    const uptime = getUptime();
    const stats = await getGithubStats();

    let readme = fs.readFileSync("README.md", "utf8");

    readme = readme
        .replace(/(Uptime:\.*\s).*/, `$1${uptime}`)
        .replace(/(Repos:\.*\s).*/, `$1${stats.repos}`)
        .replace(/(Stars:\.*\s).*/, `$1${stats.stars}`)
        .replace(/(Followers:\.*\s).*/, `$1${stats.followers}`);

    fs.writeFileSync("README.md", readme);

    console.log("README updated.");
}

main().catch(console.error);
