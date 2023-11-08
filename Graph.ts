export class Graph<T> {
    private nodes: Map<T, Node<T>>;

    constructor() {
        this.nodes = new Map();
    }

    public addEdge(headNode: T, tailNode: T) {
        this.getOrAddNode(headNode).addNext(tailNode);
        this.getOrAddNode(tailNode).addPrev(headNode);
    }

    public getNext(node: T): Set<T> {
        return this.getNode(node)?.next || new Set();
    }

    public getPrev(node: T): Set<T> {
        return this.getNode(node)?.prev || new Set();
    }

    public getAdjacent(node: T, direction: Direction): Set<T> {
        switch (direction) {
            case Direction.Forward:
                return this.getNext(node);
            case Direction.Backward:
                return this.getPrev(node);
        }
    }

    public getNodes(): T[] {
        return [...this.nodes.keys()];
    }

    private getOrAddNode(name: T): Node<T> {
        if (!this.nodes.has(name)) {
            this.nodes.set(name, new Node());
        }
        return this.nodes.get(name)!;
    }

    private getNode(name: T): Node<T> | undefined {
        return this.nodes.get(name);
    }
}

export enum Direction {
    Forward,
    Backward,
}

class Node<T> {
    next: Set<T>;
    prev: Set<T>;

    constructor() {
        this.next = new Set();
        this.prev = new Set();
    }

    public addNext(nextNode: T) {
        this.next.add(nextNode);
    }

    public addPrev(prevNode: T) {
        this.prev.add(prevNode);
    }
}
