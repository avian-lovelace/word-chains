import { Graph } from "./Graph.ts";

export function findLongPath<Key>(
    graph: Graph<Key, unknown>,
    start: Key,
    end: Key
): Key[] {
    const workingGraph = graph.transformData(
        (): Data<Key> => ({ longestPath: [] })
    );
    const startNode = workingGraph.getNode(start)!;
    startNode.data.longestPath = [start];

    let currentKeys: Set<Key> = new Set([start]);
    while (currentKeys.size > 0) {
        const modifiedKeys: Set<Key> = new Set();
        for (const key of currentKeys) {
            const node = workingGraph.getNode(key)!;
            for (const nextKey of node.next) {
                const nextNode = workingGraph.getNode(nextKey)!;
                if (
                    node.data.longestPath.length >=
                        nextNode.data.longestPath.length &&
                    !node.data.longestPath.includes(nextKey)
                ) {
                    nextNode.data.longestPath = [
                        ...node.data.longestPath,
                        nextKey,
                    ];
                    if (nextKey !== end) {
                        modifiedKeys.add(nextKey);
                    }
                }
            }
        }
        currentKeys = modifiedKeys;
    }

    return workingGraph.getNode(end)!.data.longestPath;
}

interface Data<Key> {
    longestPath: Key[];
}
