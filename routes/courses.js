let {Course, Grade} = require('../model/schemas');

function getAll(req, res) {
    Course.find().then((classes) => {
        res.send(classes);
    }).catch((err) => {
        res.send(err);
    });
}


function create(req, res) {
    let course = new Course();
    course.name = req.body.name;
    course.code = req.body.code;

    course.save()
        .then((course) => {
                res.json({message: `course saved with id ${course.id}!`});
            }
        ).catch((err) => {
        res.send('cant post course ', err);
    });
}

function detail(req, res) {
    let courseId = req.params.courseId;
    
    // First, verify the course exists
    Course.findById(courseId)
        .then((course) => {
            if (!course) {
                return res.status(404).json({message: 'Course not found'});
            }
            
            // Then fetch all grades for this course with student details populated
            return Grade.find({course: courseId})
                .populate('student')
                .then((grades) => {
                    // Return course with grades and students
                    res.json({
                        _id: course._id,
                        name: course.name,
                        code: course.code,
                        grades: grades
                    });
                });
        }).catch((err) => {
            res.status(500).json({message: 'Error fetching course', error: err.message});
        });
}

module.exports = {getAll, create, detail};