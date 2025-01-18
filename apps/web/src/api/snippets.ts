import type {
	GetSnippetsResponse,
	SaveSnippetParams,
	SaveSnippetResponse,
} from "~shared/types/snippets";
import kyInstance from "./kyInstance";

export const saveSnippet = async (
	params: Omit<SaveSnippetParams, "user">,
): Promise<SaveSnippetResponse> => {
	try {
		return await kyInstance
			.post("snippets", {
				json: params,
			})
			.json<SaveSnippetResponse>();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to save snippet: ${error.message}`);
		}
		throw new Error("An unknown error occurred while saving the snippet");
	}
};

export const getUserSnippets = async (
	userId: string,
): Promise<GetSnippetsResponse> => {
	try {
		return await kyInstance
			.get(`snippets/${userId}`)
			.json<GetSnippetsResponse>();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch snippets: ${error.message}`);
		}
		throw new Error("An unknown error occurred while fetching snippets");
	}
};
