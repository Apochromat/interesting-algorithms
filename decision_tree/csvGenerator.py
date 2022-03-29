import csv
import random

header = ['ID', 'Age', 'Size', 'Color', 'Hair', 'Friendly', 'Class']
colors = ['Brown', 'Gold', 'Cream', 'Black', 'Grey']
hairs = ['Wild', 'Short', 'Long', 'Hairless']
boolean = ['True', 'False']
sizes = ['Little', 'Medium', 'Big']
classes = ['Take', 'Leave']


with open('data.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f, delimiter=';')
    # write the header
    writer.writerow(header)

    # write the data
    for ID in range(0, 50-1):
        writer.writerow([str(ID), str(random.randint(1, 15)),
                         str(random.choices(population=sizes,
                                            weights=[0.2, 0.2, 0.6],
                                            k=1)[0]),
                         str(random.choices(population=colors,
                                            weights=[0.25, 0.1, 0.25, 0.2, 0.2],
                                            k=1)[0]),
                         str(random.choices(population=hairs,
                                            weights=[0.3, 0.4, 0.2, 0.1],
                                            k=1)[0]),
                         str(random.choices(population=boolean,
                                            weights=[0.85, 0.15],
                                            k=1)[0]),
                         str(random.choices(population=classes,
                                            weights=[0.65, 0.35],
                                            k=1)[0])
                         ])
