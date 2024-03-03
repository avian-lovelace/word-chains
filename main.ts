import wordlist from "wordlist-english";
import { Graph, Direction } from "./Graph.ts";
import { randomWalkLongPathSearch } from "./LongPathSearch/RandomWalk.ts";
import { breadthFirstLongPathSearch } from "./LongPathSearch/BreadthFirst.ts";

type WordGraphKey = string | SpecialNode;

enum SpecialNode {
    Start = 1,
    End = 2,
}

const settings: Settings = await loadSettings(Deno.args[0] ?? "settings.json");

const dictionary = getDictionary();
const dictionarySet = new Set(dictionary);
console.log(`Dictionary length: ${dictionary.length}`);
const wordGraph = makeWordGraph(dictionary);
console.log(`Graph nodes: ${wordGraph.getNodes().length}`);

const startConnectedNodes = findConnectedNodes(
    wordGraph,
    [SpecialNode.Start],
    Direction.Forward
);
console.log(`Start-connected nodes: ${startConnectedNodes.size}`);
const endConnectedNodes = findConnectedNodes(
    wordGraph,
    [SpecialNode.End],
    Direction.Backward
);
console.log(`End-connected nodes: ${endConnectedNodes.size}`);
const biconnectedNodes = [...startConnectedNodes.keys()].filter((node) =>
    endConnectedNodes.has(node)
);
console.log(`biconnected nodes: ${biconnectedNodes.length}`);

const filteredGraph = wordGraph.copyGraphAndFilterNodes(
    new Set(biconnectedNodes)
);

let longPath: WordGraphKey[] = [];
switch (settings.pathAlgorithm) {
    case "randomWalk":
        longPath = randomWalkLongPathSearch(
            filteredGraph,
            SpecialNode.Start,
            SpecialNode.End,
            settings.iterations
        );
        break;
    case "breadthFirst":
        longPath = breadthFirstLongPathSearch(
            filteredGraph,
            SpecialNode.Start,
            SpecialNode.End
        );
        break;
}
if (longPath.length > 0) {
    printWordChain(longPath);
    console.log(`Final path length: ${longPath.length - 2}`);
} else {
    console.log("Failed to find a word chain");
}

async function loadSettings(settingsFile: string): Promise<Settings> {
    const defaultSettings: Settings = {
        dictionaries: ["english/10"],
        minOverlap: 2,
        pathAlgorithm: "breadthFirst",
        iterations: 100000,
    };
    const settingsFileText = await Deno.readTextFile(settingsFile);
    const fileSettings: Partial<Settings> = JSON.parse(settingsFileText);
    return { ...defaultSettings, ...fileSettings };
}

interface Settings {
    dictionaries: string[];
    minOverlap: number;
    pathAlgorithm: "randomWalk" | "breadthFirst";
    iterations: number;
}

function getDictionary(): string[] {
    const words: string[] = settings.dictionaries.flatMap(
        (dictionary) => wordlist[dictionary]
    );
    const onlyLettersRegex = /^[a-z]+$/;
    const filteredWords = words.filter((word: string) =>
        onlyLettersRegex.test(word)
    );
    return filteredWords.sort();
}

function makeWordGraph(dictionary: string[]): Graph<WordGraphKey, undefined> {
    const wordGraph = new Graph<WordGraphKey, undefined>();
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

    const terminalNodes = wordGraph
        .getNodes()
        .filter((node) => dictionarySet.has(node as string));
    console.log(`Terminal nodes: ${terminalNodes.length}`);

    for (const terminalNode of terminalNodes) {
        wordGraph.addEdgeAndEndpoints(
            SpecialNode.Start,
            terminalNode,
            undefined,
            undefined
        );
        wordGraph.addEdgeAndEndpoints(
            terminalNode,
            SpecialNode.End,
            undefined,
            undefined
        );
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

function printWordChain(path: WordGraphKey[]) {
    const trimmedPath = path.slice(1, -1) as string[];
    const evenPath: string[] = [];
    const oddPath: string[] = [trimmedPath[0]];
    trimmedPath.forEach((fragment, i) => {
        const word =
            i !== trimmedPath.length - 1
                ? fragment + trimmedPath[i + 1]
                : fragment;
        if (i % 2 === 0) {
            evenPath.push(word);
        } else {
            oddPath.push(word);
        }
    });
    console.log(evenPath.join(" "));
    console.log();
    console.log(oddPath.join(" "));
}
