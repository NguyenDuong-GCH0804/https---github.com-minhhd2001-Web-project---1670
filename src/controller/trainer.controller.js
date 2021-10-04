const users = require("../model/users.model");
const categories = require("../model/categories.model");
const Course = require("../model/courses.model");
const Category = categories.model;
const User = users.model;

const update = async (req, res, next) => {
  try {
    const avatar = req.file.filename;
    await User.updateOne(
      { $and: [{ _id: 2 }, { role: "trainer" }] },
      {
        avatar: avatar,
        phone: req.body.phone,
        address: req.body.address,
        age: req.body.age,
        name: req.body.name,
      }
    )
      .then(() => res.redirect("/profile"))
      .catch(next);
  } catch (err) {
    console.log(err);
  }
};

const showCourses = async (req, res, next) => {
  try {
    const coursesDB = await Course.find({ idTrainer: 2 })
      .then((results) => {
        return results;
      })
      .catch((err) => {
        res.send(err);
      });
    for (let course of coursesDB) {
      let category = await Category.findOne({ _id: course.idCategory })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          return res.send(err);
        });
      course.category = category.name;
    }
    const course = coursesDB.map((courseDB) => {
      return {
        id: courseDB.id,
        name: courseDB.name,
        description: courseDB.description,
        category: courseDB.category,
        quantity: courseDB.idTrainee.length,
      };
    });
    const categories = await Category.find({})
      .then((results) => {
        return results;
      })
      .catch(next);
    // truyền vào tên người dùng
    const userName = req.name;
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const showCoursesInCategory = async (req, res, next) => {
  try {
    const idCategory = req.params.idCategory;
    if (!idCategory.match(/^[0-9a-fA-F]{24}$/))
      return res.send("No courses found");
    const coursesDB = await Course.find({
      $and: [{ idTrainer: 2 }, { idCategory }],
    })
      .then((results) => {
        return results;
      })
      .catch(next);
    for (let course of coursesDB) {
      let category = await Category.findOne({ _id: course.idCategory })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          return res.send(err);
        });
      course.category = category.name;
    }
    const course = coursesDB.map((courseDB) => {
      return {
        id: courseDB.id,
        name: courseDB.name,
        description: courseDB.description,
        category: courseDB.category,
        quantity: courseDB.idTrainee.length,
      };
    });
    const categories = await Category.find({})
      .then((results) => {
        return results;
      })
      .catch(next);
    // truyền vào tên người dùng
    const userName = req.name;
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const showTrainees = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.send("No courses found");
    const courseDB = await Course.findOne({ _id: req.params.id })
      .then((result) => {
        return result;
      })
      .catch(next);
    const traineesDB = await User.find({
      $and: [{ _id: { $in: courseDB.idTrainee } }, { role: "trainee" }],
    })
      .then((results) => {
        return results;
      })
      .catch(next);
    if (traineesDB.length == 0)
      return res.send("The course has no students yet");
    const trainees = traineesDB.map((traineeDB) => {
      return {
        name: traineeDB.name,
        email: traineeDB.email,
        age: traineeDB.age,
        phone: traineeDB.phone,
      };
    });
    // Gửi id khóa học để phục vụ việc search
    const course = {
      id: courseDB.id,
      name: courseDB.name,
    };
    res.json(trainees);
  } catch (err) {
    next(err);
  }
};

const searchCourses = async (req, res, next) => {
  try {
    const courseDB = await Course.findOne({
      $and: [{ idTrainer: 2 }, { name: req.params.name }],
    })
      .then((results) => {
        return results;
      })
      .catch(next);
    if (courseDB) {
      const categoryDB = await Category.findOne({ _id: courseDB.idCategory })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          return res.send(err);
        });
      courseDB.category = categoryDB.name;
      const course = {
        id: courseDB.id,
        name: courseDB.name,
        category: courseDB.category,
        description: courseDB.description,
        quantity: courseDB.idTrainee.length,
      };
      return res.json(course);
    } else {
      const searchName = new RegExp(req.params.name, "i");
      const coursesDB = await Course.find({
        $and: [{ idTrainer: 2 }, { name: searchName }],
      })
        .then((results) => {
          return results;
        })
        .catch(next);
      for (let course of coursesDB) {
        let categoriesDB = await Category.findOne({ _id: course.idCategory })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            return res.send(err);
          });
        course.category = categoriesDB.name;
      }
      const courses = coursesDB.map((courseDB) => {
        return {
          id: courseDB.id,
          name: courseDB.name,
          category: courseDB.category,
          description: courseDB.description,
          quantity: courseDB.idTrainee.length,
        };
      });
      res.json(courses);
    }
  } catch (err) {
    next(err);
  }
};

const searchCoursesInCategory = async (req, res, next) => {
  try {
    const idCategory = req.params.idCategory;
    if (!idCategory.match(/^[0-9a-fA-F]{24}$/))
      return res.send("No courses found");
    const courseDB = await Course.findOne({
      $and: [
        { idTrainer: 2 },
        { name: req.params.name },
        { idCategory: idCategory },
      ],
    })
      .then((results) => {
        return results;
      })
      .catch(next);
    if (courseDB) {
      const categoryDB = await Category.findOne({ _id: courseDB.idCategory })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          return res.send(err);
        });
      courseDB.category = categoryDB.name;
      const course = {
        id: courseDB.id,
        name: courseDB.name,
        category: courseDB.category,
        description: courseDB.description,
        quantity: courseDB.idTrainee.length,
      };
      return res.json(course);
    } else {
      const searchName = new RegExp(req.params.name, "i");
      const coursesDB = await Course.find({
        $and: [
          { idTrainer: 2 },
          { name: searchName },
          { idCategory: idCategory },
        ],
      })
        .then((results) => {
          return results;
        })
        .catch(next);
      for (let course of coursesDB) {
        let categoriesDB = await Category.findOne({ _id: course.idCategory })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            return res.send(err);
          });
        course.category = categoriesDB.name;
      }
      const courses = coursesDB.map((courseDB) => {
        return {
          id: courseDB.id,
          name: courseDB.name,
          category: courseDB.category,
          description: courseDB.description,
          quantity: courseDB.idTrainee.length,
        };
      });
      res.json(courses);
    }
  } catch (err) {
    next(err);
  }
};

const searchTrainees = async (req, res, next) => {
  try {
    let trainees;
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.send("No courses found");
    const idTrainees = await Course.findOne({ _id: id })
      .then((result) => {
        return result.idTrainee;
      })
      .catch(next);
    if (!isNaN(req.params.search)) {
      const traineeByAgeDB = await User.find({
        $and: [
          { _id: { $in: idTrainees } },
          { role: "trainee" },
          { age: req.params.search },
        ],
      })
        .then((result) => {
          return result;
        })
        .catch(next);
      if (traineeByAgeDB.length > 0) {
        trainees = traineeByAgeDB.map((traineeDB) => {
          return {
            name: traineeDB.name,
            email: traineeDB.email,
            age: traineeDB.age,
            phone: traineeDB.phone,
          };
        });
      }
    } else {
      const traineeByNameDB = await User.find({
        $and: [
          { _id: { $in: idTrainees } },
          { role: "trainee" },
          { name: req.params.search },
        ],
      })
        .then((result) => {
          return result;
        })
        .catch();
      if (traineeByNameDB.length > 0) {
        trainees = traineeByNameDB.map((traineeDB) => {
          return {
            name: traineeDB.name,
            email: traineeDB.email,
            age: traineeDB.age,
            phone: traineeDB.phone,
          };
        });
      } else {
        const searchName = new RegExp(req.params.search, "i");
        const traineeByNameExtendDB = await User.find({
          $and: [
            { _id: { $in: idTrainees } },
            { role: "trainee" },
            { name: searchName },
          ],
        })
          .then((result) => {
            return result;
          })
          .catch();
        if (traineeByNameExtendDB.length > 0) {
          trainees = traineeByNameExtendDB.map((traineeDB) => {
            return {
              name: traineeDB.name,
              email: traineeDB.email,
              age: traineeDB.age,
              phone: traineeDB.phone,
            };
          });
        }
      }
    }
    res.json(trainees);
  } catch (err) {
    next(err);
  }
};

const trainer = {
  update,
  showCourses,
  showCoursesInCategory,
  showTrainees,
  searchCourses,
  searchCoursesInCategory,
  searchTrainees,
};

module.exports = trainer;
