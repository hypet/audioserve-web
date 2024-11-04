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
import { AudioFileFromJSON, AudioFileToJSON, type AudioFile } from './AudioFile';

/**
 * 
 * @export
 * @interface ScoredAudioFile
 */
export interface ScoredAudioFile {
    score: number;
    item: AudioFile;
}

/**
 * Check if a given object implements the ScoredAudioFile interface.
 */
export function instanceOfScoredAudioFile(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "path" in value;
    isInstance = isInstance && "mime" in value;

    return isInstance;
}

export function ScoredAudioFileFromJSON(json: any): ScoredAudioFile {
    return ScoredAudioFileFromJSONTyped(json, false);
}

export function ScoredAudioFileFromJSONTyped(json: any, ignoreDiscriminator: boolean): ScoredAudioFile {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'score': json['score'],
        'item': AudioFileFromJSON(json['item']),
    };
}

export function ScoredAudioFileToJSON(value?: ScoredAudioFile | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'score': value.score,
        'item': AudioFileToJSON(value.item),
    };
}
