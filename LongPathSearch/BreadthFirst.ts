import { Graph } from "../Graph.ts";

/**
 * This function tries to find a long path between given start and end nodes in a graph. The algorithm is to traverse
 * the graph breadth-first, keeping track of the path taken to each node. Whenever we encounter a vertex, if the newly
 * discovered path to the vertex is strictly longer than the saved path, we replace the stored path and continue
 * exploration from the node.
 *
 * @param graph The graph to search a path in
 * @param start The key of the node where the path should start
 * @param end The key of the node where the path should end
 * @returns A list of node keys for a path from the start to the end or an empty list if the start is not connected to
 * the end
 */
export function breadthFirstLongPathSearch<Key>(
    graph: Graph<Key, unknown>,
    start: Key,
    end: Key
): Key[] {
    const workingGraph = graph.copyGraphAndTransformData(
        (): Data<Key> => ({ longestPath: [] })
    );
    const startNode = workingGraph.getNode(start);
    startNode.data.longestPath = [start];

    // I'm using iterated sets of nodes to explore rather than a queue like breadth-first search normally does. This
    // should be mostly equivalent, and is mostly because Javascript doesn't have a super easy way to do an efficient
    // queue. There may be slight benefits in deduplicating the collection of nodes to explore.
    let currentKeys: Set<Key> = new Set([start]);
    while (currentKeys.size > 0) {
        const modifiedKeys: Set<Key> = new Set();
        for (const key of currentKeys) {
            const node = workingGraph.getNode(key);
            for (const nextKey of node.next) {
                const nextNode = workingGraph.getNode(nextKey);

                // We only continue exploration if the new path to this node is longer than the existing path, and the
                // new path is non-looping.
                if (
                    node.data.longestPath.length >=
                        nextNode.data.longestPath.length &&
                    !node.data.longestPath.includes(nextKey)
                ) {
                    nextNode.data.longestPath = [
                        ...node.data.longestPath,
                        nextKey,
                    ];
                    // We don't need to continue exploration from the end node, since such exploration could not lead to
                    // a non-looping path that ends at the end node.
                    if (nextKey !== end) {
                        modifiedKeys.add(nextKey);
                    }
                }
            }
        }
        currentKeys = modifiedKeys;
    }

    return workingGraph.getNode(end).data.longestPath;
}

interface Data<Key> {
    longestPath: Key[];
}
