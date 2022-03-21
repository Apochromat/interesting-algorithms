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

def sigmoid(z):
    """The sigmoid function."""
    return 1.0/(1.0+np.exp(-z))

def sigmoid_prime(z):
    """Derivative of the sigmoid function."""
    return sigmoid(z)*(1-sigmoid(z))

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

    def feedforward(self, a):
        """Возвращает выходные данные сети, если вводится `a`."""
        for b, w in zip(self.biases, self.weights):
            a = sigmoid(np.dot(w, a) + b)
        return a

    def recognising(self, a):
        vectorised = self.feedforward(a)
        output = 0
        maximum = 0
        for i in range(len(vectorised)):
            if (vectorised[i][0] > maximum):
                maximum = vectorised[i][0]
                output = i
        return output


    def SGD(self, training_data, epochs, mini_batch_size, eta, test_data=None):
        """Обучение нейронной сети с использованием мини-пакетного стохастического
        градиентного спуска. `training_data` - это список кортежей
        `(x, y)`, представляющий входные данные для обучения и желаемый
        выходы. Другие необязательные параметры
        не требуют пояснений. Если указано `test_data`, то
        сеть будет оцениваться по тестовым данным после каждого
        эпоха и частичный прогресс распечатаны. Это полезно для
        отслеживание прогресса, но существенно замедляет работу."""
        if test_data: n_test = len(test_data)
        n = len(training_data)
        for j in range(epochs):
            random.shuffle(training_data)
            mini_batches = [
                training_data[k:k + mini_batch_size]
                for k in range(0, n, mini_batch_size)]
            for mini_batch in mini_batches:
                self.update_mini_batch(mini_batch, eta)
            if test_data:
                print("Epoch {0}: {1} / {2}".format(j, self.evaluate(test_data), n_test))
            else:
                print("Epoch {0} complete".format(j))

    def update_mini_batch(self, mini_batch, eta):
        """Обновите веса и смещения сети, применив
        градиентный спуск с использованием обратного распространения до одной мини-партии.
        `mini_batch` - это список кортежей `(x, y)`, и `eta` это скорость обучения."""
        nabla_b = [np.zeros(b.shape) for b in self.biases]
        nabla_w = [np.zeros(w.shape) for w in self.weights]
        for x, y in mini_batch:
            delta_nabla_b, delta_nabla_w = self.backprop(x, y)
            nabla_b = [nb + dnb for nb, dnb in zip(nabla_b, delta_nabla_b)]
            nabla_w = [nw + dnw for nw, dnw in zip(nabla_w, delta_nabla_w)]
        self.weights = [w - (eta / len(mini_batch)) * nw
                        for w, nw in zip(self.weights, nabla_w)]
        self.biases = [b - (eta / len(mini_batch)) * nb
                       for b, nb in zip(self.biases, nabla_b)]

    def backprop(self, x, y):
        """Возвращает кортеж `(nabla_b, nabla_w)`, представляющий
        градиент для функции затрат C_x. `nabla_b` и `nabla_w`
        представляют собой послойные списки массивов numpy, аналогичные
        ``self.biases`` и ``self.weights``."""
        nabla_b = [np.zeros(b.shape) for b in self.biases]
        nabla_w = [np.zeros(w.shape) for w in self.weights]
        # feedforward
        activation = x
        activations = [x]  # list to store all the activations, layer by layer
        zs = []  # list to store all the z vectors, layer by layer
        for i in range(len(self.weights)):
            z = np.dot(self.weights[i], activation) + self.biases[i]
            zs.append(z)
            activation = sigmoid(z)
            activations.append(activation)
        # backward pass
        delta = self.cost_derivative(activations[-1], y) * \
                sigmoid_prime(zs[-1])
        nabla_b[-1] = delta
        nabla_w[-1] = np.dot(delta, activations[-2].transpose())
        # Note that the variable l in the loop below is used a little
        # differently to the notation in Chapter 2 of the book.  Here,
        # l = 1 means the last layer of neurons, l = 2 is the
        # second-last layer, and so on.  It's a renumbering of the
        # scheme in the book, used here to take advantage of the fact
        # that Python can use negative indices in lists.
        for l in range(2, self.num_layers):
            z = zs[-l]
            sp = sigmoid_prime(z)
            delta = np.dot(self.weights[-l + 1].transpose(), delta) * sp
            nabla_b[-l] = delta
            nabla_w[-l] = np.dot(delta, activations[-l - 1].transpose())
        return (nabla_b, nabla_w)

    def evaluate(self, test_data):
        """Return the number of test inputs for which the neural
        network outputs the correct result. Note that the neural
        network's output is assumed to be the index of whichever
        neuron in the final layer has the highest activation."""
        test_results = [(np.argmax(self.feedforward(x)), y)
                        for (x, y) in test_data]
        return sum(int(x == y) for (x, y) in test_results)

    def cost_derivative(self, output_activations, y):
        """Return the vector of partial derivatives \partial C_x /
        \partial a for the output activations."""
        return (output_activations - y)
