# Word Chain Generator

This is a script I made for my own curiosity to generate what I call word chains, strings of characters that can be broken into words in two different ways. For example, the string "partnervesselfishessays" can be broken into words as
```
partner vessel fishes says
```
or as
```
part nerves selfish essays
```

The approach taken to generate word chains to to generate a graph where the nodes are half-words, and there is an edge between two half-words if they form a valid word when concatenated. Special start and end nodes are also added adjacent to nodes that are valid words on their own. Then, you can generate word chains by finding paths from the start to the end node. This approach cannot generate all possible word chains, but allows for finding long chains fairly efficiently.

## How to use
You can run the script by running the following command in the project directory.
```
deno run --allow-read main.ts settings.json
```
The script can be configured by editing `settings.json`. The available settings are:
* dictionaries (`string[]`, default `["english/10"]`) - The word lists to use. See the [wordlist-english package documentation](https://www.npmjs.com/package/wordlist-english) for possible values. 
* *minOverlap (`number`, default `2`) - The minimum overlap length between overlapping words in generated word chains. This is equivalent to the minimum length of half-words in the generated graph.
* pathAlgorithm (`string`, default `"breadthFirst"`) - The algorithm used to find a long-as-possible path in the generated path. Available options are `randomWalk` and `breadthFirst`.
* iterations (`number`, default `100000`) - The number of random walks to try when using the `randomWalk` path algorithm.
* debug (`boolean`, default `false`) - Whether to output debug-only messages.
