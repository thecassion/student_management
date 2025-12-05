let {Student, Grade} = require('../model/schemas');

function getAll(req, res) {
    Student.find().then((students) => {
        res.send(students);
    }).catch((err) => {
        res.send(err);
    });
}


function create(req, res) {
    let student = new Student();
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;

    student.save()
        .then((student) => {
                res.json({message: `student saved with id ${student.id}!`});
            }
        ).catch((err) => {
        res.send('cant post student ', err.message);
    });
}

function detail(req, res) {
    let studentId = req.params.studentId;
    
    // First, verify the student exists
    Student.findById(studentId)
        .then((student) => {
            if (!student) {
                return res.status(404).json({message: 'Student not found'});
            }
            
            // Then fetch all grades for this student with course details populated
            return Grade.find({student: studentId})
                .populate('course')
                .then((grades) => {
                    // Return student with their grades
                    res.json({
                        _id: student._id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        id: student.id,
                        grades: grades
                    });
                });
        }).catch((err) => {
            res.status(500).json({message: 'Error fetching student', error: err.message});
        });
}

module.exports = {getAll, create, detail};