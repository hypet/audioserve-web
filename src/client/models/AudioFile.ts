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

import { exists, mapValues } from '../runtime';
import type { AudioFileMeta } from './AudioFileMeta';
import {
    AudioFileMetaFromJSON,
    AudioFileMetaFromJSONTyped,
    AudioFileMetaToJSON,
} from './AudioFileMeta';
import type { AudioFileSection } from './AudioFileSection';
import {
    AudioFileSectionFromJSON,
    AudioFileSectionToJSON,
} from './AudioFileSection';

/**
 * 
 * @export
 * @interface AudioFile
 */
export interface AudioFile {
    /**
     * 
     * @type {number}
     * @memberof AudioFile
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof AudioFile
     */
    name: string;
    /**
     *
     * @type {string}
     * @memberof AudioFile
     */
    path: Array<string>;

    /**
     * 
     * @type {AudioFileMeta}
     * @memberof AudioFile
     */
    meta?: AudioFileMeta | null;
    /**
     * Mime type of audio file (before transcoding)
     * @type {string}
     * @memberof AudioFile
     */
    mime: string;
    /**
     * 
     * @type {AudioFileSection}
     * @memberof AudioFile
     */
    section?: AudioFileSection | null;
}

/**
 * Check if a given object implements the AudioFile interface.
 */
export function instanceOfAudioFile(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "path" in value;
    isInstance = isInstance && "mime" in value;

    return isInstance;
}

export function AudioFileFromJSON(json: any): AudioFile {
    return {
        'id': json['id'],
        'name': json['name'],
        'path': json['path'] as Array<string>,
        'meta': !exists(json, 'meta') ? undefined : AudioFileMetaFromJSON(json['meta']),
        'mime': json['mime'],
        'section': !exists(json, 'section') ? undefined : AudioFileSectionFromJSON(json['section']),
    };
}

export function AudioFileToIdFromJSON(json: any): [number, AudioFile] {
    return AudioFileFromJSONTyped(json, false);
}

export function AudioFileFromJSONTyped(json: any, ignoreDiscriminator: boolean): [number, AudioFile] {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return [json['id'], AudioFileFromJSON(json)];
}

export function AudioFileToJSON(value?: AudioFile | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'meta': AudioFileMetaToJSON(value.meta),
        'mime': value.mime,
        'section': AudioFileSectionToJSON(value.section),
    };
}

