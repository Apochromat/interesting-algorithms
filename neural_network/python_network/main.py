import mnist_loader
import network


def run():
    print("hi")
    data = mnist_loader.load_data_wrapper()
    net = network.Network([784, 16, 10])


if __name__ == '__main__':
    run()
