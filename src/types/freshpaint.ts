export default Freshpaint;

export interface apiObject {
  [index: string]:
    | string
    | number
    | boolean
    | undefined
    | apiObject
    | (string | number | boolean | apiObject)[];
}

export interface options {
  integrations?: { [index: string]: boolean };
}

export type apiCallback = () => void;

declare class Freshpaint {
  track(
    eventName: string,
    properties?: apiObject,
    options?: options,
    callback?: apiCallback
  ): void;

  identify(
    uniqueId?: string,
    properties?: apiObject,
    options?: options,
    callback?: apiCallback
  ): void;

  group(
    uniqueId: string | undefined,
    properties?: apiObject,
    options?: options,
    callback?: apiCallback
  ): void;

  alias(
    newId: string,
    oldId?: string,
    options?: options,
    callback?: apiCallback
  ): void;

  page(
    category?: string,
    name?: string,
    properties?: apiObject,
    options?: options,
    callback?: apiCallback
  ): void;

  ready(callback: apiCallback): void;

  reset(): void;

  addEventProperties(properties: apiObject): void;

  addPageviewProperties(properties: apiObject): void;

  addInitialEventProperties(properties: apiObject): void;

  removeEventProperty(property: string): void;
}
