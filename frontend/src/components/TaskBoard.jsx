import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TaskBoard({ tasks, onUpdate }) {

    const columns = {
        todo: tasks.filter(t => !t.completed),
        done: tasks.filter(t => t.completed)
    };

    function onDragEnd(result) {

        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId === "done";

        onUpdate(taskId, newStatus);

    }

    return (

        <DragDropContext onDragEnd={onDragEnd}>

            <div className="grid grid-cols-2 gap-4">

                {Object.entries(columns).map(([key, value]) => (

                    <Droppable droppableId={key} key={key}>

                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="border rounded-2xl p-4 bg-white"
                            >

                                <h2 className="font-bold mb-3">
                                    {key === "todo" ? "Todo" : "Done"}
                                </h2>

                                {value.map((task, index) => (
                                    <Draggable
                                        key={task.id}
                                        draggableId={String(task.id)}
                                        index={index}
                                    >

                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="border rounded-xl p-3 mb-2 bg-gray-50"
                                            >

                                                {task.title}

                                            </div>
                                        )}

                                    </Draggable>
                                ))}

                                {provided.placeholder}

                            </div>
                        )}

                    </Droppable>

                ))}

            </div>

        </DragDropContext>

    );

}