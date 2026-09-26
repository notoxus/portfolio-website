import json
import os
import sys
import requests

GITHUB_USER = os.getenv("GITHUB_REPOSITORY_OWNER", "notoxus")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # provided automatically by GitHub Actions
OUTPUT_PATH = "content/proof-of-work.json"
API_ROOT = "https://api.github.com"
GRAPHQL_URL = f"{API_ROOT}/graphql"


def _headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def fetch_user():
    res = requests.get(f"{API_ROOT}/users/{GITHUB_USER}", headers=_headers())
    res.raise_for_status()
    return res.json()


def fetch_all_repos():
    repos, page = [], 1
    while True:
        res = requests.get(
            f"{API_ROOT}/users/{GITHUB_USER}/repos",
            headers=_headers(),
            params={"per_page": 100, "page": page, "type": "owner"},
        )
        res.raise_for_status()
        batch = res.json()
        if not batch:
            break
        repos.extend(batch)
        page += 1
    return repos


def fetch_merged_upstream_prs():
    """Merged PRs authored by the user, opened against repos they don't own —
    i.e. real external contributions, not PRs merged into their own projects."""
    count, page = 0, 1
    while True:
        res = requests.get(
            f"{API_ROOT}/search/issues",
            headers=_headers(),
            params={
                "q": f"author:{GITHUB_USER} type:pr is:merged",
                "per_page": 100,
                "page": page,
            },
        )
        res.raise_for_status()
        items = res.json().get("items", [])
        if not items:
            break
        for item in items:
            owner = item["repository_url"].split("/repos/")[1].split("/")[0]
            if owner.lower() != GITHUB_USER.lower():
                count += 1
        if len(items) < 100:
            break
        page += 1
    return count


def fetch_contributions_last_12_months():
    """Real contribution count via GraphQL. Returns None (not a fake number)
    if no token is available to query it."""
    if not GITHUB_TOKEN:
        return None

    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar { totalContributions }
        }
      }
    }
    """
    res = requests.post(
        GRAPHQL_URL,
        headers=_headers(),
        json={"query": query, "variables": {"login": GITHUB_USER}},
    )
    res.raise_for_status()
    payload = res.json()
    if "errors" in payload:
        print(f"GraphQL error: {payload['errors']}", file=sys.stderr)
        return None
    return payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]["totalContributions"]


def fetch_github_stats():
    try:
        user_res = fetch_user()
        repos_res = fetch_all_repos()

        data = {
            "upstream_merges": fetch_merged_upstream_prs(),
            "tool_stars": sum(r.get("stargazers_count", 0) for r in repos_res),
            "public_contributions": fetch_contributions_last_12_months(),
            "public_repos": user_res.get("public_repos", len(repos_res)),
            "followers": user_res.get("followers", 0),
        }

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w") as f:
            json.dump(data, f, indent=2)
        print("Successfully updated proof-of-work metrics with real GitHub data.")
    except Exception as e:
        print(f"Error fetching GitHub stats: {e}", file=sys.stderr)
        sys.exit(1)  # fail the Action loudly instead of leaving stale/wrong data


if __name__ == "__main__":
    fetch_github_stats()