import type { CommentPosition } from "../mappers/comments";
import type { ExtraComments } from "../mappers/listing";
import type { Comment } from "./comment";
import type { Flair } from "./flair";
import type { Post } from "./post";
import type { SubredditAboutInfo, Subreddit } from "./subreddit";


export interface StateBase {
	account: any;
	authorFlair: Record<string, Record<string, Flair | null>>;
	postFlair: Record<string, any>;
	posts: Record<string, Post>;
	profiles: Record<string, any>;
	userFlair: Record<string, any>;
	subredditAboutInfo: Record<string, SubredditAboutInfo>;
	subreddits: Record<string, Subreddit>;
}

export interface FlatListingStateBase extends StateBase {
	dist: number;
	pinned: string[];
	token: string | null;
}

export interface SubredditListingStateBase extends StateBase {
	features?: any;
	preferences?: any;
	structuredStyles?: any;
	subredditPermissions?: any;
}


export interface PostListingPageState extends FlatListingStateBase {
	postIds: string[];
	postInstances: Record<string, any>;
}

export interface CommentListingPageState extends FlatListingStateBase {
	commentIds: string[];
	comments: Record<string, Comment>;
}

export interface CommentsPageState extends SubredditListingStateBase {
	commentLists: Record<string, { head: CommentPosition; tail: CommentPosition; }>;
	comments: Record<string, Comment>;
	continueThreads: Record<string, any>;
	moreComments: Record<string, any>;
	postMeta: null;
}

export interface ConversationsPageState extends PostListingPageState {
	commentLists: Record<string, { head: CommentPosition; tail: CommentPosition; }>;
	comments: Record<string, Comment>;
	continueThreads: Record<string, any>;
	moreComments: Record<string, any>;
	extraComments: Record<string, ExtraComments>;
}export type SubredditState = {
	subredditAboutInfo: Record<string, SubredditAboutInfo>;
	subreddits: Record<string, Subreddit>;
	postFlair: Record<string, any>;
	userFlair: Record<string, any>;
	subredditPermissions?: Record<string, any> | null;
	structuredStyles?: any;
};

