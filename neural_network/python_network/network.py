"""
Модуль для реализации алгоритма обучения стохастическому градиентному спуску
для нейронной сети с прямой связью. Градиенты вычисляются
с использованием обратного распространения.
При создании использованы материалы:
- 3b1b
- http://neuralnetworksanddeeplearning.com/chap1.html
- https://github.com/mnielsen/neural-networks-and-deep-learning
"""

import random
import numpy as np

class Network():
    def __init__(self, sizes):
        """Список `sizes` содержит количество нейронов в
        соответствующих слоях сети. Например, если список
        было [2, 3, 1], тогда это была бы трехслойная сеть,
        первый слой которой содержал бы 2 нейрона, второй слой - 3 нейрона,
        а третий слой - 1 нейрон. Смещения и веса для
        сети инициализируются случайным образом с использованием гауссовского
        распределение со средним значением 0 и дисперсией 1.
        Первый слой является входным слоем"""
        self.num_layers = len(sizes)
        self.sizes = sizes
        self.biases = [np.random.randn(y, 1) for y in sizes[1:]]
        self.weights = [np.random.randn(y, x) for x, y in zip(sizes[:-1], sizes[1:])]