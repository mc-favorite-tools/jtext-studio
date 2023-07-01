/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
export default class {
    private message: string;

    constructor(message: string) {
        this.message = message
    }
    public toString() {
        return this.message
    }
}