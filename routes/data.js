let {Course, Student, Grade} = require('../model/schemas');

function create(req, res) {
    let data = req.body;
    let processedCount = 0;
    let totalItems = data.length;
    
    for (const item of data) {
        let student = new Student({
            firstName: item.student.firstname,
            lastName: item.student.lastname,
            id: item.student.id
        });

        // if student already exists, we should find it instead of creating a new one
        Student.findOne({id: student.id}).then(existingStudent => {
            if (existingStudent) {
                return existingStudent;
            } else {
                return student.save();
            }
        }).then(savedStudent => {
            let course = new Course({
                name: item.course.split(' ')[0].trim(),
                code: item.course.split(' ')[1].trim()
            });
            
            // Use findOneAndUpdate with upsert to avoid duplicates
            return Course.findOneAndUpdate(
                {name: course.name, code: course.code},
                {name: course.name, code: course.code},
                {upsert: true, new: true, setDefaultsOnInsert: true}
            ).then(foundOrCreatedCourse => {
                return {course: foundOrCreatedCourse, student: savedStudent};
            });
        }).then(result => {
            let grade = new Grade({
                student: result.student._id,
                course: result.course._id,
                grade: item.grade,
                date: new Date(item.date)
            });
            
            return grade.save();
        }).then(() => {
            processedCount++;
            if (processedCount === totalItems) {
                console.log('All items processed successfully');
            }
        }).catch(err => {
            console.error('Error processing item:', err);
            processedCount++;
        });
    }

    res.json({message: 'Data processing started'});
}

module.exports = {create};