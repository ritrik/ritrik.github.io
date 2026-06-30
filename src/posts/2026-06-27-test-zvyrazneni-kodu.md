---
title: Test zvýraznění kódu
date: 2026-06-27
excerpt: Ukázkový článek pro ověření zvýraznění syntaxe v šesti jazycích — C#, PowerShell, JavaScriptu, Pythonu, Rustu a Go.
draft: true
tags:
  - kód
  - csharp
  - powershell
  - javascript
  - python
  - rust
  - go
---

Tenhle článek slouží jen k ověření, že zvýrazňování syntaxe funguje. Níže je krátká
ukázka v každém z podporovaných jazyků.

## C#

```csharp
using System;

namespace Demo
{
    // Jednoduchý příklad
    public class Program
    {
        public static void Main(string[] args)
        {
            int count = 42;
            Console.WriteLine($"Ahoj, světe! ({count})");
        }
    }
}
```

## PowerShell

```powershell
# Vypíše pět procesů s největším využitím paměti
Get-Process |
    Sort-Object -Property WorkingSet -Descending |
    Select-Object -First 5 Name,
        @{ Name = "MB"; Expression = { [math]::Round($_.WorkingSet / 1MB, 1) } }
```

## JavaScript

```javascript
// Fibonacciho posloupnost
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));

for (let i = 0; i < 10; i++) {
  console.log(`fib(${i}) = ${fib(i)}`);
}
```

## Python

```python
# Prvočísla pomocí Eratosthenova síta
def primes(limit: int) -> list[int]:
    sieve = [True] * limit
    for n in range(2, int(limit ** 0.5) + 1):
        if sieve[n]:
            for m in range(n * n, limit, n):
                sieve[m] = False
    return [i for i in range(2, limit) if sieve[i]]


print(primes(30))
```

## Rust

```rust
// Výpočet faktoriálu
fn factorial(n: u64) -> u64 {
    (1..=n).product()
}

fn main() {
    let n = 10;
    println!("{}! = {}", n, factorial(n));
}
```

## Go

```go
package main

import "fmt"

// greet vrátí pozdrav se jménem
func greet(name string) string {
    return fmt.Sprintf("Ahoj, %s!", name)
}

func main() {
    fmt.Println(greet("světe"))
}
```
