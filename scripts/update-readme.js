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
    const query = `
    query($login: String!) {
      user(login: $login) {
        followers {
          totalCount
        }

        repositories(
          ownerAffiliations: OWNER
          first: 100
          isFork: false
        ) {
          totalCount
          nodes {
            stargazerCount
          }
        }

        contributionsCollection {
          totalCommitContributions
        }
      }
    }`;

    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            "User-Agent": USERNAME
        },
        body: JSON.stringify({
            query,
            variables: {
                login: USERNAME
            }
        })
    });

    const json = await response.json();

    if (json.errors) {
        console.error(json.errors);
        throw new Error("GraphQL query failed.");
    }

    const user = json.data.user;

    const stars = user.repositories.nodes.reduce(
        (sum, repo) => sum + repo.stargazerCount,
        0
    );

    return {
        repos: user.repositories.totalCount,
        stars,
        followers: user.followers.totalCount,
        commits: user.contributionsCollection.totalCommitContributions
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
        .replace(/(Commits:\.*\s).*/, `$1${stats.commits}`)
        .replace(/(Followers:\.*\s).*/, `$1${stats.followers}`);

    fs.writeFileSync("README.md", readme);

    console.log("README updated successfully!");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
