"""
Source: https://github.com/MichalDanielDobrzanski/DeepLearningPython
"""
import math
import random
import numpy as np

def sigmoid(z):
    return 1.0/(1.0+np.exp(-z))

def sigmoid_prime(z):
    return sigmoid(z)*(1-sigmoid(z))

class Network():
    def __init__(self, sizes, data = None):
        self.num_layers = len(sizes)
        self.sizes = sizes
        self.biases = [np.random.randn(y, 1) for y in sizes[1:]]
        self.weights = [np.random.randn(y, x) for x, y in zip(sizes[:-1], sizes[1:])]
        if (data != None):
            self.biases = np.array(data["biases"], dtype=object)
            self.weights = np.array(data["weights"], dtype=object)

    def feedforward(self, a):
        for bias, weight in zip(self.biases, self.weights):
            a = sigmoid(np.dot(weight, a) + bias)
        return a

    def recognising(self, input):
        vectorised = self.feedforward(input)
        output, maximum = 0
        for i in range(len(vectorised)):
            if (vectorised[i][0] > maximum):
                maximum = vectorised[i][0]
                output = i
        return output

    def evaluate(self, test_data):
        test_results = [(np.argmax(self.feedforward(x)), y) for (x, y) in test_data]
        return sum(int(x == y) for (x, y) in test_results)

    def training(self, training_data, epochs, mini_batch_size, grad_step):
        if test_data: n_test = len(test_data)
        n = len(training_data)
        for j in range(epochs):
            random.shuffle(training_data)
            mini_batches = [training_data[k:k + mini_batch_size] for k in range(0, n, mini_batch_size)]
            for mini_batch in mini_batches:
                self.update_mini_batch(mini_batch, grad_step)
            else:
                print("Epoch {0} complete".format(j))

    def update_mini_batch(self, mini_batch, grad_step):
        grad_b = [np.zeros(b.shape) for b in self.biases]
        grad_w = [np.zeros(w.shape) for w in self.weights]
        for x, y in mini_batch:
            delta_grad_b, delta_grad_w = self.backprop(x, y)
            grad_b = [gb + dgb for gb, dgb in zip(grad_b, delta_grad_b)]
            grad_w = [gw + dgw for gw, dgw in zip(grad_w, delta_grad_w)]
        self.weights = [w - (grad_step / len(mini_batch)) * gw for w, gw in zip(self.weights, grad_w)]
        self.biases = [b - (grad_step / len(mini_batch)) * gb for b, gb in zip(self.biases, grad_b)]

    def backprop(self, x, y):
        grad_b = [np.zeros(b.shape) for b in self.biases]
        grad_w = [np.zeros(w.shape) for w in self.weights]
        # feedforward
        activation = x
        activations = [x]  # list to store all the activations, layer by layer
        z_vectors = []  # list to store all the z vectors, layer by layer
        for i in range(len(self.weights)):
            z = np.dot(self.weights[i], activation) + self.biases[i]
            z_vectors.append(z)
            activation = sigmoid(z)
            activations.append(activation)
        # backward pass
        delta = self.cost_derivative(activations[-1], y) * sigmoid_prime(z_vectors[-1])
        grad_b[-1] = delta
        grad_w[-1] = np.dot(delta, activations[-2].transpose())
        
        for l in range(2, self.num_layers):
            z = z_vectors[-l]
            sp = sigmoid_prime(z)
            delta = np.dot(self.weights[-l + 1].transpose(), delta) * sp
            grad_b[-l] = delta
            grad_w[-l] = np.dot(delta, activations[-l - 1].transpose())
        return (grad_b, grad_w)

    def cost_derivative(self, output_activations, y):
        return (output_activations - y)
