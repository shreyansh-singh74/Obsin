import { fetchGitHubApi } from "./api";
import { GithubUser } from "@/types";

export async function fetchAuthenticationUser(token: string): Promise<GithubUser> {
    const { data } = await fetchGitHubApi('/user', token);

    return {
        login: data.login,
        name: data.name ?? null,
        avatar_url: data.avatar_url,
        html_url: data.html_url
    };
}