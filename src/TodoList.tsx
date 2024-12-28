import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import React from "react";
import { Json } from "@aws-amplify/data-schema";

const client = generateClient<Schema>();

export default function TodoList() {
    const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);
    const [content, setContent] = useState<Json>("tmp");
    const [fileContent, setFileContent] = useState<File | null>(null);

    const fetchTodos = async () => {
        const { data: items, errors } = await client.models.Todo.list();
        setTodos(items);
    };

    useEffect(() => {
        fetchTodos();
    }, []);



    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    // Parse the file content as JSON
                    const jsonContent = JSON.parse(reader.result as string);
                    setFileContent(jsonContent);
                } catch (error) {
                    console.error("Invalid JSON file", error);
                }
            };
            reader.readAsText(selectedFile); // Read the file as a text string

        }
    };


    const createTodo = async () => {
        console.log(fileContent)

        try {
            const userId = window.prompt("Username");
            const id = userId === null || userId.trim() === "" ? "undefined" : userId;


            console.log("File uploading");

            await client.models.Todo.create({
                id: id,
                content: (fileContent ? JSON.stringify(fileContent) : "None"),

            });


            console.log("File uploaded successfully");
        } catch (error) {
            console.error("Error uploading file:", error);

            fetchTodos();
        }
    }



        const selectUser = async (username) => {
            const userFiles = todos.filter((record) =>
                record.id.includes(username) // Searching by filename with the username
            );


            setContent(userFiles[0].content ?? "None")
        }


        
        // const uploadFile = async (username) => {
        //     if (fileContent) {
        //         try {
        //             const fileName = `player_data/${username}_match_data.json`; // Using username in the file name


        //             const file = fileContent;

        //             // const result = await Storage.put(fileName, file, {
        //             //   contentType: "application/json", // Specifying the file type
        //             // });

        //             await client.models.Todo.create({
        //                 id: fileName,
        //                 content: window.prompt("Todo content?"),
        //             });


        //             // console.log("File uploaded successfully:", result);
        //         } catch (error) {
        //             console.error("Error uploading file:", error);
        //         }
        //     } else {
        //         alert("Please specify a username and select a file to upload.");
        //     }
        // };



        // Delete a specific Todo by id
        const deleteTodo = async (id: string) => {
            try {
                const todoToDelete = await client.models.Todo.get({ id }); // Query the specific Todo by id
                if (todoToDelete) {
                    await client.models.Todo.delete({ id }); // Delete the Todo from DataStore
                    fetchTodos(); // Refresh the list after deletion
                }
            } catch (error) {
                console.error("Error deleting todo:", error);
            }
        };

        return (
            <div>
                <button onClick={createTodo}>Add new todo</button>
                <input type="file" onChange={handleFileChange} />

                <h2>Content: {JSON.stringify(content)}</h2>


                <ul>
                    {todos.map(({ id, content }) => (
                        <span><button key={id} onClick={() => (selectUser(id))}>{id}</button> <button onClick={() => (deleteTodo(id))}>Remove</button><br></br></span>
                    ))}
                </ul>

            </div>
        );
    }