def caesar_cipher(text, shift, mode='encode'):
    result = ''
    shift = shift % 26
    if mode == 'decode':
        shift = -shift
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - base + shift) % 26 + base)
        else:
            result += char
    return result

# Example Usage:
encoded = caesar_cipher("Hello, World!", 3)
decoded = caesar_cipher(encoded, 3, mode='decode')
print("Encoded:", encoded)
print("Decoded:", decoded)




def indian_currency_format(number):
    num_str = "{:.4f}".format(number) if "." in str(number) else str(number)
    parts = num_str.split('.')
    integer_part = parts[0]
    decimal_part = '.' + parts[1] if len(parts) > 1 else ''

    # Start from right
    if len(integer_part) <= 3:
        return integer_part + decimal_part

    last_3 = integer_part[-3:]
    rest = integer_part[:-3]

    # Group rest into 2 digits from the end
    grouped = ''
    while len(rest) > 2:
        grouped = ',' + rest[-2:] + grouped
        rest = rest[:-2]

    if rest:
        grouped = rest + grouped

    return grouped + ',' + last_3 + decimal_part

# Example Usage:
print(indian_currency_format(123456.7891))  # 1,23,456.7891




def combine_lists(list1, list2):
    combined = sorted(list1 + list2, key=lambda x: x["positions"][0])
    result = []
    for item in combined:
        if not result:
            result.append(item)
            continue
        prev = result[-1]
        l1, r1 = prev["positions"]
        l2, r2 = item["positions"]

        # Calculate overlap
        overlap = max(0, min(r1, r2) - max(l1, l2))
        len2 = r2 - l2

        if overlap >= len2 / 2:
            # Merge into previous
            prev["values"].extend(item["values"])
            prev["positions"][1] = max(r1, r2)
        else:
            result.append(item)

    return result

# Example Usage:
list1 = [{"positions": [0, 5], "values": [1, 2]}]
list2 = [{"positions": [3, 7], "values": [3, 4]}]
print(combine_lists(list1, list2))



def minimize_loss(prices):
    min_loss = float('inf')
    buy_year = sell_year = -1
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            if prices[j] < prices[i]:
                loss = prices[i] - prices[j]
                if loss < min_loss:
                    min_loss = loss
                    buy_year = i + 1
                    sell_year = j + 1
    return buy_year, sell_year, min_loss

# Example Usage:
prices = [20, 15, 7, 2, 13]
buy, sell, loss = minimize_loss(prices)
print(f"Buy in year {buy}, Sell in year {sell}, Loss: {loss}")
