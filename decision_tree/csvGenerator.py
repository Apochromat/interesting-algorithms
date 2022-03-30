import csv
import random
length = 150

header = ['Id', 'Age', 'Sex', 'Size', 'Breed', 'Friendly', 'Class']
breeds = ['Labrador', 'Bulldog', 'Retriever', 'Beagle', 'Rottweiler', 'Shepherd']
boolean = ['True', 'False']
sexes = ['Female', 'Male']
sizes = ['Little', 'Medium', 'Big']
classes = ['Take', 'Leave']


with open('data.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f, delimiter=';')
    # write the header
    writer.writerow(header)

    # write the data
    for ID in range(0, length):
        row = [str(ID),
               str(random.randint(1, 15)),
               str(random.choice(sexes)),
               str(random.choices(population=sizes,
                                  weights=[0.2, 0.2, 0.6],
                                  k=1)[0]),
               str(random.choice(breeds)),
               str(random.choices(population=boolean,
                                  weights=[0.85, 0.15],
                                  k=1)[0])
               ]
        if int(row[1]) > 10:
            if row[5] == 'True':
                if row[3] == 'Little':
                    if row[2] == 'Female':
                        row.append(classes[1])
                    elif row[2] == 'Male':
                        row.append(classes[0])
                elif row[3] == 'Medium':
                    row.append(classes[0])
                elif row[3] == 'Big':
                    row.append(classes[1])
            else:
                row.append(classes[0])
        else:
            if row[4] == 'Labrador':
                row.append(classes[0])
            elif row[4] == 'Bulldog':
                if row[3] == 'Little':
                    row.append(classes[1])
                elif row[3] == 'Medium':
                    row.append(classes[0])
                elif row[3] == 'Big':
                    row.append(classes[0])
            elif row[4] == 'Retriever':
                if row[2] == 'Female':
                    if int(row[1]) > 8:
                        if row[5] == 'True':
                            row.append(classes[0])
                        else:
                            row.append(classes[1])
                    else:
                        row.append(classes[0])
                elif row[2] == 'Male':
                    if row[3] == 'Little':
                        row.append(classes[0])
                    elif row[3] == 'Medium':
                        row.append(classes[0])
                    elif row[3] == 'Big':
                        row.append(classes[1])
            elif row[4] == 'Beagle':
                row.append(classes[0])
            elif row[4] == 'Rottweiler':
                if row[5] == 'True':
                    if row[2] == 'Female':
                        row.append(classes[0])
                    elif row[2] == 'Male':
                        if int(row[1]) > 5:
                            row.append(classes[0])
                        else:
                            row.append(classes[1])
                elif row[5] == 'False':
                    row.append(classes[1])
            elif row[4] == 'Shepherd':
                row.append(classes[1])
        writer.writerow(row)
