import wordlist from "wordlist-english";
import { Graph, Direction } from "./Graph.ts";

const settings: Settings = await loadSettings(Deno.args[0] ?? "settings.json");

const dictionary = getDictionary();
console.log(`Dictionary length: ${dictionary.length}`);
const wordGraph = makeWordGraph(dictionary);
console.log(`Graph nodes: ${wordGraph.getNodes().length}`);
const dictionarySet = new Set(dictionary);
const terminalNodes = wordGraph
    .getNodes()
    .filter((node) => dictionarySet.has(node));
console.log(`Terminal nodes: ${terminalNodes.length}`);
const startConnectedNodes = findConnectedNodes(
    wordGraph,
    terminalNodes,
    Direction.Forward
);
console.log(`Start-connected nodes: ${startConnectedNodes.size}`);
const endConnectedNodes = findConnectedNodes(
    wordGraph,
    terminalNodes,
    Direction.Backward
);
console.log(`End-connected nodes: ${endConnectedNodes.size}`);
const biconnectedNodes = [...startConnectedNodes.keys()].filter((node) =>
    endConnectedNodes.has(node)
);
console.log(`biconnected nodes: ${biconnectedNodes.length}`);
const biconnectedNontermialNodes = biconnectedNodes.filter(
    (node) => !dictionarySet.has(node)
);
const startNodes = terminalNodes.filter((node) => {
    const nextNodes = wordGraph.getNext(node);
    return biconnectedNontermialNodes.some((biconnectedNode) =>
        nextNodes.has(biconnectedNode)
    );
});
const endNodes = terminalNodes.filter((node) => {
    const prevNodes = wordGraph.getPrev(node);
    return biconnectedNontermialNodes.some((biconnectedNode) =>
        prevNodes.has(biconnectedNode)
    );
});

const filteredNodes = [
    ...biconnectedNontermialNodes,
    ...startNodes,
    ...endNodes,
];
const filteredGraph = wordGraph.makeFilteredGraph(new Set(filteredNodes));

let longestPath: string[] = [];
for (let i = 0; i < 1000000; i++) {
    let currentNode = startNodes[Math.floor(Math.random() * startNodes.length)];
    const path = [currentNode];
    while (path.length === 1 || !dictionarySet.has(currentNode)) {
        const nextNodes = [...filteredGraph.getNext(currentNode)];
        currentNode = nextNodes[Math.floor(Math.random() * nextNodes.length)];
        path.push(currentNode);
    }
    if (
        new Set(path).size === path.length &&
        path.length > longestPath.length
    ) {
        longestPath = path;
    }
}
console.log(longestPath);

async function loadSettings(settingsFile: string): Promise<Settings> {
    const defaultSettings: Settings = {
        dictionary: "english/10",
        minOverlap: 2,
    };
    const settingsFileText = await Deno.readTextFile(settingsFile);
    const fileSettings: Partial<Settings> = JSON.parse(settingsFileText);
    return { ...defaultSettings, ...fileSettings };
}

interface Settings {
    dictionary: string;
    minOverlap: number;
}

function getDictionary(): string[] {
    const words: string[] = wordlist[settings.dictionary];
    const onlyLettersRegex = /^[a-z]+$/;
    const filteredWords = words.filter((word: string) =>
        onlyLettersRegex.test(word)
    );
    return filteredWords.sort();
}

// function getStartWords(dictionary: string[]): string[] {
//     return dictionary.filter((word: string, index: number) =>
//         dictionary[index + 1]?.startsWith(word)
//     );
// }

function makeWordGraph(dictionary: string[]): Graph<string, undefined> {
    const wordGraph = new Graph<string, undefined>();
    for (const word of dictionary) {
        for (
            let i = settings.minOverlap;
            i < word.length - settings.minOverlap;
            i++
        ) {
            const startFragment = word.slice(0, i);
            const endFragment = word.slice(i);
            wordGraph.addEdgeAndEndpoints(
                startFragment,
                endFragment,
                undefined,
                undefined
            );
        }
    }
    return wordGraph;
}

function findConnectedNodes<T>(
    graph: Graph<T, unknown>,
    startNodes: T[],
    direction: Direction
): Set<T> {
    const visitedNodes = new Set(startNodes);
    const nodeStack = [...startNodes];
    while (nodeStack.length > 0) {
        const currentNode = nodeStack.pop()!;
        const nextNodes = graph.getAdjacent(currentNode, direction);
        nextNodes?.forEach((nextNode) => {
            if (!visitedNodes.has(nextNode)) {
                nodeStack.push(nextNode);
                visitedNodes.add(nextNode);
            }
        });
    }
    return visitedNodes;
}
