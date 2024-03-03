import { Graph } from "../Graph.ts";

/**
 * This function tries to find a long path between given start and end nodes in a graph. The algorithm is to perform a
 * lot of random walks, and return the longest path from start to end found in those random walks.
 *
 * @param graph The graph to search a path in
 * @param start The key of the node where the path should start
 * @param end The key of the node where the path should end
 * @param iterations The number of random walks to take
 * @returns A list of node keys for the longest path found from the start to the end
 */
export function randomWalkLongPathSearch<Key>(
    graph: Graph<Key, unknown>,
    start: Key,
    end: Key,
    iterations: number
): Key[] {
    let bestPath: Key[] = [];
    for (let i = 0; i < iterations; i++) {
        const path = [start];
        let currentKey = start;
        while (currentKey !== end) {
            const nextKeys = graph.getNext(currentKey);

            // If we know we can improve the best path by going to the end node next, do it
            if (path.length >= bestPath.length && nextKeys.has(end)) {
                currentKey = end;
            } else {
                // Don't allow duplicate nodes in the path. If this restriction is removed, this function needs another
                // way to avoid initite loops
                const validNextKeys = [...nextKeys].filter(
                    (key) => !path.includes(key)
                );
                if (validNextKeys.length === 0) {
                    break;
                }
                currentKey =
                    validNextKeys[
                        Math.floor(Math.random() * validNextKeys.length)
                    ];
            }
            path.push(currentKey);
        }
        if (currentKey === end && path.length > bestPath.length) {
            bestPath = path;
        }
    }
    return bestPath;
}
