const express = reqire("express");
const {open} = reqire("sqlite");
const sqlite3 = reqire("sqlite3");
const path = reqire("path");
const dbpath= path.join(__dirname,todoApplication.db);
const app = express()

app.use(express.json());
let db= null;
const initializeDbAndServer = async() => {
    try {
        db = await open({
            filename: dbpath,
            driver : sqlite3.Database
        })
        app.listen(3000, () => 
        console.log("Server Running at http://localhost3000/")
        )
    }catch (error) {
        console.log(`DB Error ${error.message}`)
        process.exit(1);
    }
}
initializeDbAndServer();

const hasPriorandStatusProperty = (requestquery) => {
    return(
        requestquery.priority !==  undefined && requestquery.status !== undefined
    )
}
const hasPriorityProperty = (requestquery) => {
    return requestquery.priority !== undefined;

}
const hasStatusPrority = (requestquery) => {
    return requestquery.status !== undefined;
}

app.get("/todos/", async (request, response)=>{
    let data = null
    const {search_q = "", priority, status} = request.query;
    switch (true) {
        case hasPriorandStatusProperty(request.query):
        getTodoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        break
        case hasPriorityProperty(request.query):
        getTodoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        break;
        case hasPriorandStatusProperty(request.query):
        getTodoQuery = `
        SELECT 
        * FROM
        todo
        WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';
        `;
        break ;
        default:
        getTodoQuery = `
        SELECT
        *
        FROM
        todo
        WHERE
        todo LIKE '%${search_q}%';
        `;
        
    } 
    data = await db.all(getTodoQuery);
    response.send(data);
});
app.get("/todos/:todoId/", async (request, response)=> {
    const {todoId} = request.params;
    const getTodoQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    id = ${todoId};`;
    const todo = await db.get(getTodoQuery);
    response.send(todo);
});

app.post("/todos/", async (request, response)=> {
    const {id, todo, priority, status} = request.body;
    const postTodoQuery = `
    INSERT INTO 
    todo (id, todo, priority, status)
    VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
    await db.run(postTodoQuery);
    response.send("Todo Successfully Added");

});

app.put("/todos/:todoId/", async (request, response)=> {
    const {todoId} = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    switch (true);
    case requestBody.status !== undefined;
    updateColumn = "Status";
    break
    case requestBody.priority !== undefined
    updateColumn = "Priority";
    break
    case requestBody.todo !== undefined;
    updateColumn ="Todo";
    break
    
    const previousTodoQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    ID = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);
    const {
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status = previousTodo.status,

    }= request.body;
    const updateTodoQuery = `
    UPDATE
    todo
    SET
    todo='${todo}',
    priority='${priority}',
    status= '${status}',
    WHERE
    id = ${todoId};`;

await db.run(updateTodoQuery);
response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response)=> {
    const {todoId} = request.params;
    const deleteTodoQuery = `
    DELETE FROM
    todo
    WHERE
    id = ${todoId};`;
    await db.run(deleteTodoQuery);
    response.send("Todo Deleted");
});
module.exports = app;
