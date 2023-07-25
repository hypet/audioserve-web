/* tslint:disable */
/* eslint-disable */
/**
 * audioserve API
 * REST API for audioserve
 *
 * The version of the OpenAPI document: 1.3.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  AudioFolder,
  CollectionsInfo,
  SearchResult,
  TranscodingsInfo,
} from '../models';
import {
    AudioFolderFromJSON,
    CollectionsInfoFromJSON,
    CollectionsInfoToJSON,
    SearchResultFromJSON,
    SearchResultToJSON,
    TranscodingsInfoFromJSON,
    TranscodingsInfoToJSON,
} from '../models';

export interface ColIdAudioPathGetRequest {
    colId: number;
    path: string;
    seek?: number;
    trans?: ColIdAudioPathGetTransEnum;
    range?: string;
}

export interface ColIdCoverPathGetRequest {
    colId: number;
    path: string;
}

export interface ColIdDescPathGetRequest {
    colId: number;
    path: string;
}

export interface ColIdDownloadPathGetRequest {
    colId: number;
    path: string;
    fmt?: ColIdDownloadPathGetFmtEnum;
}

export interface ColIdFolderGetRequest {
    colId: number;
    ord?: ColIdFolderGetOrdEnum;
    group?: string;
}

export interface ColIdFolderPathGetRequest {
    colId: number;
    path: string;
    ord?: ColIdFolderPathGetOrdEnum;
    group?: string;
}

export interface ColIdIconPathGetRequest {
    colId: number;
    path: string;
}

export interface ColIdAllGetRequest {
    colId: number;
}

export interface ColIdRecentGetRequest {
    colId: number;
    group?: string;
}

export interface ColIdSearchGetRequest {
    colId: number;
    q: string;
    ord?: ColIdSearchGetOrdEnum;
    group?: string;
}

/**
 * 
 */
export class CollectionsApi extends runtime.BaseAPI {

    /**
     * Streams (possibly transcoded) audio file  File is sent either directly  (in this case [http bytes range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)  is supported - but only one range per response)   or transcoded  (in this case response content is [chunck encoded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding)  and its length is not known in advance). Transcoding is triggered by query string paramater `trans`.  Typical usecase is that client loads transcoding parameters from `transcodings` endpoint  and then for each audio file decides if transcoding is required or not based on `mime` and `bitrate` values  available in folder listing.  Transcoded files can be also seek for playback start-  query string parameter `seek` can contain start of stream in seconds (related to  normal begining of file).  Plain, not transcoded files cannot be seeked in this way (they support byte ranges, which are  usually enough for a player to seek efficiently). So `seek` can be used only with `trans`.  Number of transcoding processing is limited on server, as it is lengthy and resources demanding (mainly CPU)  process. If maximum number of transcodings is already used, this endpoint will return HTTP response 503 Service Unavailable.  It\'s client responsibility to handle such cases. 
     */
    async colIdAudioPathGetRaw(requestParameters: ColIdAudioPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Blob>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdAudioPathGet.');
        }

        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling colIdAudioPathGet.');
        }

        const queryParameters: any = {};

        if (requestParameters.seek !== undefined) {
            queryParameters['seek'] = requestParameters.seek;
        }

        if (requestParameters.trans !== undefined) {
            queryParameters['trans'] = requestParameters.trans;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters.range !== undefined && requestParameters.range !== null) {
            headerParameters['range'] = String(requestParameters.range);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/audio/{path}`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))).replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.BlobApiResponse(response);
    }

    /**
     * Streams (possibly transcoded) audio file  File is sent either directly  (in this case [http bytes range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)  is supported - but only one range per response)   or transcoded  (in this case response content is [chunck encoded](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding)  and its length is not known in advance). Transcoding is triggered by query string paramater `trans`.  Typical usecase is that client loads transcoding parameters from `transcodings` endpoint  and then for each audio file decides if transcoding is required or not based on `mime` and `bitrate` values  available in folder listing.  Transcoded files can be also seek for playback start-  query string parameter `seek` can contain start of stream in seconds (related to  normal begining of file).  Plain, not transcoded files cannot be seeked in this way (they support byte ranges, which are  usually enough for a player to seek efficiently). So `seek` can be used only with `trans`.  Number of transcoding processing is limited on server, as it is lengthy and resources demanding (mainly CPU)  process. If maximum number of transcodings is already used, this endpoint will return HTTP response 503 Service Unavailable.  It\'s client responsibility to handle such cases. 
     */
    async colIdAudioPathGet(requestParameters: ColIdAudioPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Blob> {
        const response = await this.colIdAudioPathGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns cover image for indicated `path` (if exists) Path for cover should be taken from object returend by `folder` endpoint. 
     */
    async colIdCoverPathGetRaw(requestParameters: ColIdCoverPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Blob>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdCoverPathGet.');
        }

        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling colIdCoverPathGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/cover/{path}`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))).replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.BlobApiResponse(response);
    }

    /**
     * Returns cover image for indicated `path` (if exists) Path for cover should be taken from object returend by `folder` endpoint. 
     */
    async colIdCoverPathGet(requestParameters: ColIdCoverPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Blob> {
        const response = await this.colIdCoverPathGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns description file (if exists) Path for description file should be taken from object returend by `folder` endpoint. 
     */
    async colIdDescPathGetRaw(requestParameters: ColIdDescPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdDescPathGet.');
        }

        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling colIdDescPathGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/desc/{path}`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))).replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.TextApiResponse(response) as any;
    }

    /**
     * Returns description file (if exists) Path for description file should be taken from object returend by `folder` endpoint. 
     */
    async colIdDescPathGet(requestParameters: ColIdDescPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.colIdDescPathGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Downloads content of folder as an archive (zip or tar) Downloads all files (audio files, cover, description) from this folder as an archive (zip or tar).  Default format of the archive is zip, tar archive is also supported - format can be chosen by `fmt` query parameter  Also if you want to change default format by compiling audioserve with `folder-download-default-tar` feature.  This endpoint can be disabled, if audioserve is compiled without default feature `folder-download`  or with command line argument `--disable-folder-download` . 
     */
    async colIdDownloadPathGetRaw(requestParameters: ColIdDownloadPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Blob>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdDownloadPathGet.');
        }

        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling colIdDownloadPathGet.');
        }

        const queryParameters: any = {};

        if (requestParameters.fmt !== undefined) {
            queryParameters['fmt'] = requestParameters.fmt;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/download/{path}`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))).replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.BlobApiResponse(response);
    }

    /**
     * Downloads content of folder as an archive (zip or tar) Downloads all files (audio files, cover, description) from this folder as an archive (zip or tar).  Default format of the archive is zip, tar archive is also supported - format can be chosen by `fmt` query parameter  Also if you want to change default format by compiling audioserve with `folder-download-default-tar` feature.  This endpoint can be disabled, if audioserve is compiled without default feature `folder-download`  or with command line argument `--disable-folder-download` . 
     */
    async colIdDownloadPathGet(requestParameters: ColIdDownloadPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Blob> {
        const response = await this.colIdDownloadPathGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List contents of  root folder of the collection. See `/{col_id}/folder/{path}` for more detailed description. 
     */
    async colIdFolderGetRaw(requestParameters: ColIdFolderGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AudioFolder>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdFolderGet.');
        }

        const queryParameters: any = {};

        if (requestParameters.ord !== undefined) {
            queryParameters['ord'] = requestParameters.ord;
        }

        if (requestParameters.group !== undefined) {
            queryParameters['group'] = requestParameters.group;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/folder/`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AudioFolderFromJSON(jsonValue));
    }

    /**
     * List contents of  root folder of the collection. See `/{col_id}/folder/{path}` for more detailed description. 
     */
    async colIdFolderGet(requestParameters: ColIdFolderGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AudioFolder> {
        const response = await this.colIdFolderGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Lists available subfolders or audio files in the folder. Response contains arrays `files` and/or `subfolders` (each can be null or empty array).  Subfolders can be listed using this API endpoint, `files` contains playable files -   their `path` should be used with `audio` endpoint for streaming file content. 
     */
    async colIdFolderPathGetRaw(requestParameters: ColIdFolderPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<AudioFolder>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdFolderPathGet.');
        }

        if (requestParameters.path === null || requestParameters.path === undefined) {
            throw new runtime.RequiredError('path','Required parameter requestParameters.path was null or undefined when calling colIdFolderPathGet.');
        }

        const queryParameters: any = {};

        if (requestParameters.ord !== undefined) {
            queryParameters['ord'] = requestParameters.ord;
        }

        if (requestParameters.group !== undefined) {
            queryParameters['group'] = requestParameters.group;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/folder/{path}`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))).replace(`{${"path"}}`, encodeURIComponent(String(requestParameters.path))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AudioFolderFromJSON(jsonValue));
    }

    /**
     * Lists audio files in the folder. Response contains arrays `files` and/or `subfolders` (each can be null or empty array).  Subfolders can be listed using this API endpoint, `files` contains playable files -   their `path` should be used with `audio` endpoint for streaming file content.
     */
    async colIdAllRaw(requestParameters: ColIdAllGetRequest, initOverrides?: RequestInit): Promise<runtime.ApiResponse<AudioFolder>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdFolderPathGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/all`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AudioFolderFromJSON(jsonValue));
    }

    /**
     * Lists available subfolders or audio files in the folder. Response contains arrays `files` and/or `subfolders` (each can be null or empty array).  Subfolders can be listed using this API endpoint, `files` contains playable files -   their `path` should be used with `audio` endpoint for streaming file content. 
     */
    async colIdFolderPathGet(requestParameters: ColIdFolderPathGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<AudioFolder> {
        const response = await this.colIdFolderPathGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Lists available subfolders or audio files in the folder. Response contains arrays `files` and/or `subfolders` (each can be null or empty array).  Subfolders can be listed using this API endpoint, `files` contains playable files -   their `path` should be used with `audio` endpoint for streaming file content. 
     */
    async colIdAll(requestParameters: ColIdAllGetRequest, initOverrides?: RequestInit): Promise<AudioFolder> {
        const response = await this.colIdAllRaw(requestParameters, initOverrides);
        return await response.value();
    } 
    
    /**
     * Lists top 100 most recent folders in the collection (based on folder modification time).  Sorted by folder modification time descendently - e.g most recent is first. 
     */
    async colIdRecentGetRaw(requestParameters: ColIdRecentGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SearchResult>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdRecentGet.');
        }

        const queryParameters: any = {};

        if (requestParameters.group !== undefined) {
            queryParameters['group'] = requestParameters.group;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/recent`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SearchResultFromJSON(jsonValue));
    }

    /**
     * Lists top 100 most recent folders in the collection (based on folder modification time).  Sorted by folder modification time descendently - e.g most recent is first. 
     */
    async colIdRecentGet(requestParameters: ColIdRecentGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SearchResult> {
        const response = await this.colIdRecentGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Search collection - search for terms with collection paths (path only not metadata tags). Search is looking only for folders (including virtual folders for chaptered files).  Search term is split to words and each word is searched in full path (relative collection root -  the path you see in folder listing). First path that includes all words in added to results (and it\'s subfolders are not searched further). 
     */
    async colIdSearchGetRaw(requestParameters: ColIdSearchGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<SearchResult>> {
        if (requestParameters.colId === null || requestParameters.colId === undefined) {
            throw new runtime.RequiredError('colId','Required parameter requestParameters.colId was null or undefined when calling colIdSearchGet.');
        }

        if (requestParameters.q === null || requestParameters.q === undefined) {
            throw new runtime.RequiredError('q','Required parameter requestParameters.q was null or undefined when calling colIdSearchGet.');
        }

        const queryParameters: any = {};

        if (requestParameters.ord !== undefined) {
            queryParameters['ord'] = requestParameters.ord;
        }

        if (requestParameters.group !== undefined) {
            queryParameters['group'] = requestParameters.group;
        }

        if (requestParameters.q !== undefined) {
            queryParameters['q'] = requestParameters.q;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/{col_id}/search`.replace(`{${"col_id"}}`, encodeURIComponent(String(requestParameters.colId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => SearchResultFromJSON(jsonValue));
    }

    /**
     * Search collection - search for terms with collection paths (path only not metadata tags). Search is looking only for folders (including virtual folders for chaptered files).  Search term is split to words and each word is searched in full path (relative collection root -  the path you see in folder listing). First path that includes all words in added to results (and it\'s subfolders are not searched further). 
     */
    async colIdSearchGet(requestParameters: ColIdSearchGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SearchResult> {
        const response = await this.colIdSearchGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns list of available collections (collection is a directory provided as parameter to audioserve server).  It should be first call to server, after client authenticates itself.
     */
    async collectionsGetRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CollectionsInfo>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/collections/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CollectionsInfoFromJSON(jsonValue));
    }

    /**
     * Returns list of available collections (collection is a directory provided as parameter to audioserve server).  It should be first call to server, after client authenticates itself.
     */
    async collectionsGet(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CollectionsInfo> {
        const response = await this.collectionsGetRaw(initOverrides);
        return await response.value();
    }

    /**
     * Gets current transcoding settings on the server. Server has 3 transcodings presets: `high`, `medium`, `low` (or no transcoding), between which client can choose, when  streaming audofile.  If `max_transcodings` is reached server returns `503 Service Unavailable` -  it\'s client responsibility to retry later. Normally should be called after `collections` call, unless client is not interested in transcoding capabilities at all.
     */
    // async transcodingsGetRaw(initOverrides?: RequestInit): Promise<runtime.ApiResponse<TranscodingsInfo>> {
    //     const queryParameters: any = {};

    //     const headerParameters: runtime.HTTPHeaders = {};

    //     if (this.configuration && this.configuration.accessToken) {
    //         const token = this.configuration.accessToken;
    //         const tokenString = await token("bearerAuth", []);

    //         if (tokenString) {
    //             headerParameters["Authorization"] = `Bearer ${tokenString}`;
    //         }
    //     }
    //     const response = await this.request({
    //         path: `/transcodings/`,
    //         method: 'GET',
    //         headers: headerParameters,
    //         query: queryParameters,
    //     }, initOverrides);

    //     return new runtime.JSONApiResponse(response, (jsonValue) => TranscodingsInfoFromJSON(jsonValue));
    // }

    // /**
    //  * Gets current transcoding settings on the server. Server has 3 transcodings presets: `high`, `medium`, `low` (or no transcoding), between which client can choose, when  streaming audofile.  If `max_transcodings` is reached server returns `503 Service Unavailable` -  it\'s client responsibility to retry later. Normally should be called after `collections` call, unless client is not interested in transcoding capabilities at all.
    //  */
    // async transcodingsGet(initOverrides?: RequestInit): Promise<TranscodingsInfo> {
    //     const response = await this.transcodingsGetRaw(initOverrides);
    //     return await response.value();
    // }

}

/**
 * @export
 */
export const ColIdAudioPathGetTransEnum = {
    L: 'l',
    M: 'm',
    H: 'h',
    _0: '0'
} as const;
export type ColIdAudioPathGetTransEnum = typeof ColIdAudioPathGetTransEnum[keyof typeof ColIdAudioPathGetTransEnum];
/**
 * @export
 */
export const ColIdDownloadPathGetFmtEnum = {
    Zip: 'zip',
    Tar: 'tar'
} as const;
export type ColIdDownloadPathGetFmtEnum = typeof ColIdDownloadPathGetFmtEnum[keyof typeof ColIdDownloadPathGetFmtEnum];
/**
 * @export
 */
export const ColIdFolderGetOrdEnum = {
    A: 'a',
    M: 'm'
} as const;
export type ColIdFolderGetOrdEnum = typeof ColIdFolderGetOrdEnum[keyof typeof ColIdFolderGetOrdEnum];
/**
 * @export
 */
export const ColIdFolderPathGetOrdEnum = {
    A: 'a',
    M: 'm'
} as const;
export type ColIdFolderPathGetOrdEnum = typeof ColIdFolderPathGetOrdEnum[keyof typeof ColIdFolderPathGetOrdEnum];
/**
 * @export
 */
export const ColIdSearchGetOrdEnum = {
    A: 'a',
    M: 'm'
} as const;
export type ColIdSearchGetOrdEnum = typeof ColIdSearchGetOrdEnum[keyof typeof ColIdSearchGetOrdEnum];
