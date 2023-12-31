import { INFO, POSTS, INTERESTS, PROJECTS, COMMUNITY_ID } from '/public/constants/Database.js';
import { postRequest } from './BaseRequest.js';

const path = 'display/';

//Get data for a all community
export async function getCommunities() {
    const message = {};

    const endpoint = path + "communities"; // display/info
    return await postRequest(endpoint, message);
}

//Get data for a single community
export async function getCommunityInfo(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + INFO; // display/info
    return await postRequest(endpoint, message);
}

//Get all projects within a community
export async function getCommunityProjects(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + PROJECTS; // display/projects
    return await postRequest(endpoint, message);
}

//Get all events within a community
export async function getCommunityEvents(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + "events"; // display/projects
    return await postRequest(endpoint, message);
}

//Get last 50posts from community
export async function getCommunityPosts(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + POSTS; // display/posts
    return await postRequest(endpoint, message);
}

//Get interests and frequency in a community
export async function getCommunityInterests(community_id) {
    const message = {
        [COMMUNITY_ID]: community_id
    };

    const endpoint = path + INTERESTS; // display/interests
    return await postRequest(endpoint, message);
}

