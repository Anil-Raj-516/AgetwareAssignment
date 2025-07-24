#### Problem: Caesar Cipher encoding and decoding

In cryptography, a Caesar cipher, also known as Caesar's cipher, the shift cipher, Caesar's code, or Caesar shift, is one of the simplest and most widely known encryption techniques. It is a type of substitution cipher in which each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. \
For example, with a left shift of 3, D would be replaced by A, E would become B, and so on. The method is named after Julius Caesar, who used it in his private correspondence

Write code that implements encoding and decoding of a message.
The parameters for the methods would be the message to be encoded / decoded and the length of the shift.

#### Problem: Convert number into a comma separated Indian currency format

In Indian numbering system the terms used are different from what is used in the western numbering system. \
Terms like Lakh to represent one hundred thousand and Crore to represent 10 Million.

Write code that takes as input a floating point number and returns an indian number string representation with commas separating the digits.

Eg: 123456.7891 should return 1,23,456.7891

#### Problem: Combining two lists

Consider a list of elements within a line having position and values in the following format:

```python
[
    {
        "positions": [left_position, right_position],
        "values": [value1, value2, ...]
    },
    ...
]
```

The left_position and right_position represents the position of the element in the line. \
Write code to combine two lists of the above format sorted by the left position. \
Values of the elements are to be combined if more than half of an element is contained within the other and positions of the element that appears first can be considered. For reference:
![alt text](image.png)

#### Problem: Minimizing Loss

Rajeev has a chart of distinct projected prices for a house over the next several years. He must buy the house in one year and sell it in another, and he must do so at a loss. He wants to minimize her financial loss.
Eg:

```python
price = [20, 15, 7, 2, 13]
```

His minimum loss is incurred by purchasing in year 2 at price[1] and selling in year 5 at price[4]\
Write code that takes as input the number of years and prices for those years and outputs the year to buy and sell in with the loss value

#### Evaluation Guidelines:

Code will be evaluated on the basis of efficiency, proper use of data structures and correct output return.
