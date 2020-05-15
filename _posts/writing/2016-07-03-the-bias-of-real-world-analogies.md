---
layout: post
category: writing
date: 2016-07-03
title: "The bias of real-world analogies"
# jekyll-seo-tag
description: "When concrete representations hinders your reasoning about a problem."
author: "Soreine"
category: writing
---

<section>

Recently, I had to implement some functions to move items in an ordered collection, and I made it way more complicated than needed. My collections were ordered trees and I was moving subtrees around, but the problem is similar with simple lists, so we will talk about lists.

Here is one of the functions I wanted to implement:

> `move(collection, i, j)`
>
> Returns a new collection where the item at index `i` is now at index `j`

Let's assume we already have two basic functions at our disposal:

- `insert(collection, i, item)` that returns a new collection where `item` was added at index `i`
- `remove(collection, i)` that returns a new collection without the item that was at index `i`

Moving an item in a collection is essentially taking it from an index, and inserting it at another . So the function `move` is some simple composition of our two basic functions, `remove` then `insert`. The only pitfall is that removing or inserting shifts some items in the collection, so we need to be careful because we might end up inserting our item back to the wrong index.

For lists, it is simple to determine if we need to insert back at `i` or `i - 1`. In my case, it was a bit more complicated. In my ordered trees, the indexes were a sequences of indexes (or paths) in the tree:

```
.
├── 0
│   ├── 0.0
│   └── 0.1
└── 1
    ├── 1.0
    └── 1.1
```

Determining the impact on indexes when removing a subtree was a bit trickier than lists. A few bugs later, and I had written the code to handle that, and could implement the `move` function. Add on top of that that I wanted `move(collection, i, i)` to be a no-op, and I was gone full paranoid, looking everywhere after edge cases.

</div>
</section>
<section>
<div markdown="1">

_Actually, all this can be a lot simpler._

</div>
</section>
<section>
<div markdown="1">

I realised that **I was biased by concepts of our physical world**. I was inclined to believe that an item needs to be taken from somewhere first, to be put somewhere else after. But inside the Matrix, you're free to do it in any order. Using real-world analogies is helpful to the mind, but it can be deceiving too.

Instead of trying to calculate the new indexes all the time, we just need to know whether removing first or inserting first will not mess up the indexes. Because doing some operation at index `i` will only impact `j` if `i < j`. For trees, we can compare indexes using the alphabetical order.

Our `move` function ends up looking like this:

```ruby
function move(collection, i, j)
    if (i < j)
        insert at j
        remove i
    else
        remove i
        insert at j
```

</div>
</section>
<section>
<div markdown="1">

Now free your mind. You will be a happier person. Just like Morpheus.

![Morpheus](/blog/images/morpheus.jpg)

</div>
</section>
