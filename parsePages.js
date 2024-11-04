const fs = require('fs');
const { exec } = require('child_process');

// Function to load and parse JSON file
function loadJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading JSON file:", err);
        return null;
    }
}

// Function to execute a shell command, log the command and its output, and capture the ID
function runCommandCapture(command) {
    return new Promise((resolve, reject) => {
        ///console.log(`Running command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                reject(new Error(stderr));
                return;
            }

            ///console.log(`Command Output:\n${stdout}`);

            // Attempt to capture the ID from the command output
            const idMatch = stdout.match(/id: '([^']+)'/);
            if (idMatch && idMatch[1]) {
                const id = idMatch[1];
                ///console.log(`Captured ID: ${id}`);
                resolve(id);
            } else {
                console.error("Failed to capture ID from command output.");
                reject(new Error("Failed to capture ID from command output."));
            }
        });
    });
}

function runCommandPlain(command) {
    return new Promise((resolve, reject) => {
        ///console.log(`Running command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(`Command failed with error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                reject(`Command failed with stderr: ${stderr}`);
                return;
            }

            ///console.log(`Command Output:\n${stdout}`);
            resolve("Command executed successfully");
        });
    });
}

async function updateContent(itemId, content) {
    const command = `hax site node:edit --item-id ${itemId} --node-op content --content "${content}" --y`;
    try {
        const result = await runCommandPlain(command);
        ///console.log(`Successfully updated content for item ${itemId}: ${result}`);
    } catch (error) {
        console.error(`Failed to update content for item ${itemId}: ${error}`);
    }
}


// Function to set the parent of a node
async function setParent(childId, parentId) {
    const command = `hax site node:edit --item-id ${childId} --node-op parent --parent ${parentId} --y`;
    try {
        const result = await runCommandPlain(command);
        ///console.log(`Successfully set parent for item ${childId} to ${parentId}: ${result}`);
    } catch (error) {
        console.error(`Failed to set parent for item ${childId} to ${parentId}: ${error}`);
    }
}

// Function to handle the course structure (course title, objective, goals, units)
async function processCourseStructure(course) {
    // Step 1: Create the course title as the top-level item
    const courseCommand = `hax site node:add --title "${course.course_title}" --y --v`;
    const courseId = await runCommandCapture(courseCommand);

    // Step 2: Create the objective as a child of the course title
    const objectiveCommand = `hax site node:add --title "Objective" --y --v`;
    const objectiveId = await runCommandCapture(objectiveCommand);
    await setParent(objectiveId, courseId);
    await updateContent(objectiveId, course.course_objectives.objective); // Update content for objective

    // Step 3: Create the goals as a single grouped child of the objective
    //const goalsText = course.course_objectives.goals.map(goal => `- ${goal}`).join('\n\n\n');
    const goalsText = course.course_objectives.goals.map(goal => `<h3>${goal}</h3>`).join('\n\n');
    const goalsCommand = `hax site node:add --title "Goals" --y --v`;
    const goalsId = await runCommandCapture(goalsCommand);
    await setParent(goalsId, objectiveId);
    await updateContent(goalsId, goalsText); // Update content for goals


    // Step 4: Handle units, lessons, and topics
    const units = []; // Array to store units with their ID and lessons
    for (const unit of course.units) {
        const unitCommand = `hax site node:add --title "${unit.unit_title}" --y --v`;
        const unitId = await runCommandCapture(unitCommand);

        const lessons = [];
        for (const lesson of unit.lessons) {
            const lessonCommand = `hax site node:add --title "${lesson.lesson_title}" --y --v`;
            const lessonId = await runCommandCapture(lessonCommand);

            const topics = [];
            for (const topic of lesson.topics) {
                const topicCommand = `hax site node:add --title "${topic.topic}" --y --v`;
                const topicId = await runCommandCapture(topicCommand);

                topics.push({ id: topicId });
                await updateContent(topicId, topic.content); // Update content for each topic
            }
            lessons.push({ id: lessonId, topics, parentId: unitId });
        }
        units.push({ id: unitId, lessons, parentId: courseId }); // Attach unit to the course title
    }

    // Step 5: Set parent relationships for units, lessons, and topics
    for (const unit of units) {
        await setParent(unit.id, courseId); // Link unit to course title
        for (const lesson of unit.lessons) {
            await setParent(lesson.id, unit.id); // Link lesson to unit
            for (const topic of lesson.topics) {
                await setParent(topic.id, lesson.id); // Link topic to lesson
            }
        }
    }


}

// Load and process the course JSON data
async function main() {
    const course = loadJSON('../newaicourse.json');
    if (course) {
        await processCourseStructure(course);
    }
}

main();
