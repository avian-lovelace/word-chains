/**
 * Class representing a simple directed graph
 */
export class Graph<Key, Data> {
    private nodes: Map<Key, Node<Key, Data>>;

    constructor() {
        this.nodes = new Map();
    }

    /**
     * Gets the node with the provided key if it already exists, or creates a node with the given key if it doesn't.
     */
    private getOrAddNode(key: Key, data: Data): Node<Key, Data> {
        return (
            this.nodes.get(key) ??
            this.nodes.set(key, new Node(key, data)).get(key)!
        );
    }

    /**
     * Gets a node by its key.
     * @throws if the graph contains no node with the provided key.
     */
    public getNode(key: Key): Node<Key, Data> {
        const node = this.nodes.get(key);
        if (!node) {
            throw new Error(`No node was found with key ${key}`);
        }
        return node;
    }

    /**
     * Get the full list of node keys of the graph.
     */
    public getNodes(): Key[] {
        return [...this.nodes.keys()];
    }

    /**
     * Adds a directed edge to the graph between the vertices with the provided keys.
     * @throws if the graph contains no node with either of the provided keys.
     */
    public addEdge(headNode: Key, tailNode: Key) {
        this.getNode(headNode).addNext(tailNode);
        this.getNode(tailNode).addPrev(headNode);
    }

    /**
     * Adds a directed edge to the graph between the vertices with the provided keys, creating the endpoint verices if necessary.
     */
    public addEdgeAndEndpoints(
        headNode: Key,
        tailNode: Key,
        headData: Data,
        tailData: Data
    ) {
        this.getOrAddNode(headNode, headData).addNext(tailNode);
        this.getOrAddNode(tailNode, tailData).addPrev(headNode);
    }

    /**
     * Get the set of heads of edges whose tails are the node with the provided key.
     * @throws if the graph contains no node with the provided key.
     */
    public getNext(node: Key): Set<Key> {
        return this.getNode(node).next || new Set();
    }

    /**
     * Get the set of tails of edges whose heads are the node with the provided key.
     * @throws if the graph contains no node with the provided key.
     */
    public getPrev(node: Key): Set<Key> {
        return this.getNode(node).prev || new Set();
    }

    /**
     * Get all nodes one arc away from the node with the provided key in the provided direction. Intended to enable
     * functions that easily switch between following edges forwards or backwards.
     * @throws if the graph contains no node with the provided key.
     */
    public getAdjacent(node: Key, direction: Direction): Set<Key> {
        switch (direction) {
            case Direction.Forward:
                return this.getNext(node);
            case Direction.Backward:
                return this.getPrev(node);
        }
    }

    /**
     * Creates the induced subgraph from the provided subset of node keys.
     */
    public copyGraphAndFilterNodes(nodes: Set<Key>): Graph<Key, Data> {
        const filteredGraph = new Graph<Key, Data>();

        for (const node of nodes) {
            const nextNodes = this.getNext(node);
            for (const nextNode of nextNodes) {
                if (nodes.has(nextNode)) {
                    filteredGraph.addEdgeAndEndpoints(
                        node,
                        nextNode,
                        this.nodes.get(node)!.data,
                        this.nodes.get(nextNode)!.data
                    );
                }
            }
        }

        return filteredGraph;
    }

    /**
     * Creates a copy of the graph, except the provided transformation is applied to the data of all vertices.
     */
    public copyGraphAndTransformData<TransformedData>(
        dataTransform: (oldData: Data) => TransformedData
    ): Graph<Key, TransformedData> {
        const transformedGraph: Graph<Key, TransformedData> = new Graph<
            Key,
            TransformedData
        >();

        for (const node of this.nodes.values()) {
            transformedGraph.getOrAddNode(node.key, dataTransform(node.data));
        }

        for (const node of this.nodes.values()) {
            const nextNodes = this.getNext(node.key);
            for (const nextNode of nextNodes) {
                transformedGraph.addEdge(node.key, nextNode);
            }
        }

        return transformedGraph;
    }
}

export enum Direction {
    Forward,
    Backward,
}

/**
 * Class representing a graph vertex. This is intended to be an internal class to Graph, not used externally.
 */
class Node<Key, Data> {
    key: Key;
    next: Set<Key>;
    prev: Set<Key>;
    data: Data;

    constructor(key: Key, data: Data) {
        this.key = key;
        this.next = new Set();
        this.prev = new Set();
        this.data = data;
    }

    public addNext(nextNode: Key) {
        this.next.add(nextNode);
    }

    public addPrev(prevNode: Key) {
        this.prev.add(prevNode);
    }
}
