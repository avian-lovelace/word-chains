export class Graph<Key, Data> {
    private nodes: Map<Key, Node<Key, Data>>;

    constructor() {
        this.nodes = new Map();
    }

    public addEdgeAndEndpoints(
        headNode: Key,
        tailNode: Key,
        headData: Data,
        tailData: Data
    ) {
        this.getOrAddNode(headNode, headData).addNext(tailNode);
        this.getOrAddNode(tailNode, tailData).addPrev(headNode);
    }

    public getNext(node: Key): Set<Key> {
        return this.getNode(node)?.next || new Set();
    }

    public getPrev(node: Key): Set<Key> {
        return this.getNode(node)?.prev || new Set();
    }

    public getAdjacent(node: Key, direction: Direction): Set<Key> {
        switch (direction) {
            case Direction.Forward:
                return this.getNext(node);
            case Direction.Backward:
                return this.getPrev(node);
        }
    }

    public getNodes(): Key[] {
        return [...this.nodes.keys()];
    }

    public makeFilteredGraph(nodes: Set<Key>): Graph<Key, Data> {
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

    private getOrAddNode(key: Key, data: Data): Node<Key, Data> {
        if (!this.nodes.has(key)) {
            this.nodes.set(key, new Node(key, data));
        }
        return this.nodes.get(key)!;
    }

    private getNode(key: Key): Node<Key, Data> | undefined {
        return this.nodes.get(key);
    }
}

export enum Direction {
    Forward,
    Backward,
}

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
