import { INFO, POSTS, INTERESTS, PROJECTS } from '/public/constants/Database.js';
import { postRequest } from './BaseRequest.js';

const path = 'display/';


export async function getCommunityInfo(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + INFO; // display/info
    return await postRequest(endpoint, message);
}

export async function getCommunityPosts(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + POSTS; // display/posts
    return await postRequest(endpoint, message);
}

export async function getCommunityInterests(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + INTERESTS; // display/interests
    return await postRequest(endpoint, message);
}

export async function getCommunityProjects(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + PROJECTS; // display/projects
    return await postRequest(endpoint, message);
}