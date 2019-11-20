const mongo = require('mongodb');

const client = new mongo.MongoClient('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});

function addNewTodo(todosCollection, title) {
    todosCollection.insertOne({
        title,
        done: false,
    }, err => {
        if(err) {
            console.log('Błąd podczas dodawania');
        } else {
            console.log("zadanie dodane.");
        }
        client.close()
    }

    )
    
}
function showAllTodos(todosCollection) {
    todosCollection.find({}).toArray((err, todos) => {
        if(err) {
            console.log('Błąd podczas pobierania!', err)
        } else {
            const todosToDo = todos.filter(todo => !todo.done);
            const todosDone = todos.filter(todo => todo.done);

            console.log(`# Lista zadań do zrobienia (niezakończone) ${todosToDo.length}`);
            for(const todo of todosToDo) {
                console.log(`- ${todo.title}`)
            }
            console.log(`# Lista zadań do zrobienia (zakończone) ${todosDone.length}`);
            for(const todo of todosDone) {
                console.log(`- ${todo.title}`)
            }
        }
        client.close()
    })
}
function markTaskAsDone(todosCollection, id) {
    todosCollection.find({
        _id: mongo.ObjectID(id),
    }).toArray((err,todos) => {
        if (err) {
            console.log("Błąd podczas pobierania!", err);
            client.close()
        } else if (todos.length !== 1) {
            console.log("Nie ma takie zadania")
            client.close()
        } else if (todos[0].done) {
            console.log('To zadanie było już zakończone')
            client.close()
        } else {


        todosCollection.updateOne({
            _id: mongo.ObjectID(id),
        }, {
            $set: {
                done: true,
            },
        }, err => {
            if(err) {
                console.log('Błąd podczas ustawiania zakończenia');
            } else {
                console.log("zadanie oznaczone jako zakończone.");
            }
            client.close()
        })
    }
    })
}
function deleteTodo(todosCollection, id) {
    todosCollection.find({
        _id: mongo.ObjectID(id),
    }).toArray((err,todos) => {
        if (err) {
            console.log("Błąd podczas pobierania!", err);
            client.close()
        } else if (todos.length !== 1) {
            console.log("Nie ma takie zadania")
            client.close()
        } else if (todos[0].done) {
            console.log('To zadanie było już usunięte')
            client.close()
        } else {


        todosCollection.deleteOne({
            _id: mongo.ObjectID(id),
        }, err => {
            if(err) {
                console.log('Błąd podczas usuwania');
            } else {
                console.log("zadanie usunięte.");
            }
            client.close()
        })
    }
    })
}
function deleteAllDoneTasks(todosCollection) {
        todosCollection.deleteMany({
            done: true,
        }, err => {
            if(err) {
                console.log('Błąd podczas usuwania');
            } else {
                console.log("Wyczyszczono zakończone zadania, o ile takie były");
            }
            client.close()
        })

}

function doTheToDo(todosCollection) {
    const [command, ...args] = process.argv.splice(2);

    switch(command) {
        case 'add':
            addNewTodo(todosCollection, args[0])
            break;
        case 'list':
            showAllTodos(todosCollection);
            break;
        case 'done':
            markTaskAsDone(todosCollection, args[0])
            break;
        case 'delete':
            deleteTodo(todosCollection, args[0])
            break;
        case 'cleanup':
            deleteAllDoneTasks(todosCollection, args[0])
            break;
        default:
            console.log(`
            #### Lista TO DO ####

            Dostępne komendy:
            add <nazwa zadania> - dodaje zadanie do wykonania
            list - wyświetla zadania
            done <id zadania> - ustawia zadanie jako wykonane
            delete <id zadania> - usuwa dane zadanie
            cleanup - usuwa wszystkie wykonane zadania
            `);
            client.close();
            break;
    }
}
client.connect(err => {
    if(err) {
        console.log('Błąd połączenia!', err)
    } else {
        console.log('Połączenie udane!');
        const db = client.db('test');
        const todosCollection = db.collection('todos');
        doTheToDo(todosCollection)
    }
});