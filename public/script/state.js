class States {
    /**
     * Create a new States instance.
     */
    constructor() {
        this.state = {};
    }

    /**
     * Merge new state directly into the existing state.
     * @param {Object} [newState={}] - The new state to merge. Must be a non-null object.
     * @throws {Error} Throws an error if newState is not a non-null object.
     * @example
     * const states = new States();
     * states.setState({ key1: 'value1', key2: 'value2' });
     */
    setState(newState = {}) {
        if (typeof newState !== 'object' || newState === null) {
            throw new Error('New state must be a non-null object');
        }
        this.state = Object.assign(this.state, newState);
    }

    /**
     * Retrieve the value of a specific state key.
     * @param {string} [stateKey=""] - The key of the state to retrieve.
     * @returns {*} The value of the state key, or undefined if the key does not exist.
     * @throws {Error} Throws an error if stateKey is not a string.
     * @example
     * const value = states.getState('key1');
     */
    getState(stateKey = "") {
        if (typeof stateKey !== 'string') {
            throw new Error('State key must be a string');
        }
        return stateKey ? this.state[stateKey] : this.state;
    }

    /**
   * Check if a specific state key exists.
   * @param {string} [stateKey=""] - The key of the state to check.
   * @returns {boolean} True if the state key exists, false otherwise.
   * @throws {Error} Throws an error if stateKey is not a string.
   * @example
   * const exists = states.hasState('key1');
   */
    hasState(stateKey = "") {
        if (typeof stateKey !== 'string') {
            throw new Error('State key must be a string');
        }
        return stateKey in this.state;
    }

    /**
     * Remove a specific state key.
     * @param {string} [stateKey=""] - The key of the state to remove.
     * @throws {Error} Throws an error if stateKey is not a string.
     * @example
     * states.removeState('key1');
     */
    removeState(stateKey = "") {
        if (typeof stateKey !== 'string') {
            throw new Error('State key must be a string');
        }
        if (stateKey in this.state) {
            delete this.state[stateKey];
        }
    }

    /**
     * Clear all states.
     * @example
     * states.clearState();
     */
    clearState() {
        this.state = {};
    }
}
const globalStates = new States();

