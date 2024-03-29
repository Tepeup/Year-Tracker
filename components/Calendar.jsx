import React, { useState, useEffect } from "react";
import calendar from "calendar-js";
import moment from "moment";
import firebase from "firebase/app";
import "firebase/firestore";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import WorkoutModal from "../components/WorkoutModal";
import Dialog from "@material-ui/core/Dialog";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function Calendar(props) {
  // Converting the calendar array form calendar-js to an array of objects with relevant info
  let arrayToObjectArray = calendar()
    .of(moment().year(), props.month)
    .calendar.map((el) =>
      el.map((el) => ({
        date: el,
        month: props.month,
        colorCode: "#556171",
      }))
    );

  // date variables used throughout

  const todaysMonth = moment().month();
  const todaysDate = moment().date();
  const todaysYear = moment().year();
  const currentMonthString = moment().month(todaysMonth).format("MMMM");
  const monthStringName = moment().month(props.month).format("MMMM");
  const yearMonth = moment([todaysYear]).month(props.month).format("YYYY-MM");
  const daysInMonth = moment(yearMonth, "YYYY-MM").daysInMonth();

  // Hooks
  const classes = useStyles();
  const [cellInfo, setCellInfo] = useState(arrayToObjectArray);
  const [calendarData, setCalendarData] = useState(cellInfo);
  const [open, setOpen] = useState({
    state: false,
    month: null,
    day: null,
    year: null,
    week: null,
    weekDay: null,
  });

  var dateObj = new Date();
  var thismonth = dateObj.getUTCMonth() + 1; //months from 1-12

  const handleOpen = (month, day, year, week, weekDay) => {
    if (!day == 0) {
      if (moment().month(month).format("M") < thismonth) {
        setOpen({
          state: true,
          month: month,
          day: day,
          year: year,
          week: week,
          weekDay: weekDay,
        });
      } else if (moment().month(month).format("M") == thismonth) {
        if (todaysDate >= day) {
          setOpen({
            state: true,
            month: month,
            day: day,
            year: year,
            week: week,
            weekDay: weekDay,
          });
        }
      }
    }
  };

  const handleClose = () => {
    setOpen({ ...open, state: false, month: null, day: null, year: null });
  };

  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  const attempt = calendarData
    .map((x) =>
      x.map(
        (e) => {
          switch (e.colorCode) {
            case "#556171" || "rgb(85, 97, 113)":
              return 0;
              break;
            case "#ede900" || "rgb(237, 233, 0)":
              return 1;
              break;
            case "#ff8606" || "rgb(255, 134, 6)":
              return 2;
              break;
            case "#e83b36" || "rgb(232, 59, 54)":
              return 3;
              break;
            case "#600538" || "rgb(96, 5, 56)":
              return 5;
              break;
            default:
              return 0;
          }
        }
        // e.colorCode == "#556171" || e.colorCode == "rgb(85, 97, 113)" ? 0 : 1
      )
    )
    .map((x) => x.reduce(reducer))
    .reduce(reducer);

  // Get users month data from Firebase
  useEffect(() => {
    const firestore = firebase.firestore();
    firestore
      .collection("Charts")
      .doc(`${props.user.id}`)
      .collection(`${todaysYear}`)
      .doc(`${monthStringName}`)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setCalendarData(JSON.parse(snapshot.data().chartData));
        } else {
          return;
        }
      });

    // Set window to current month
    setTimeout(function () {
      if (!props.mini) {
        window.location.hash = `${currentMonthString}`;
        if (currentMonthString == monthStringName) {
          window.scrollBy(0, -50);
        }
      }
    }, 300);
  }, []);

  let handleModalSubmit = async (day, week, color, workout, notes) => {
    let copyGrid = [...calendarData];

    let mutatedOject = copyGrid[week][day];

    copyGrid[week][day] = {
      ...mutatedOject,
      colorCode: color,
      workout: workout,
      notes: notes,
    };
    setOpen({ ...open, state: false, month: null, day: null, year: null });

    await firebase
      .firestore()
      .collection("Charts")
      .doc(`${props.user.id}`)
      .collection(`${todaysYear}`)
      .doc(`${monthStringName}`)
      .set({ chartData: `${JSON.stringify(copyGrid)}` })
      .catch((error) => {
        alert(`Error`, error);
      });

    setCalendarData(copyGrid);
  };

  return (
    <div
      className={`cal-month-container ${
        props.mini && "cal-month-container-mini"
      }`}
      id={`${monthStringName}`}
    >
      <div>
        <Dialog
          fullScreen
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={open.state}
          onClose={handleClose}
          overflow="scroll"
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open.state}>
            <div>
              <WorkoutModal
                close={handleClose}
                month={open.month}
                day={open.day}
                year={open.year}
                week={open.week}
                weekDay={open.weekDay}
                submit={handleModalSubmit}
                calendar={calendarData}
              />
            </div>
          </Fade>
        </Dialog>
      </div>
      <span className={`month-title ${props.mini && "month-title-mini"}`}>
        {`${monthStringName} ${todaysYear}  `}
        {attempt > 35 ? (
          <div>
            <FontAwesomeIcon id={"diamond"} icon={faStar} title={`Diamond`} />{" "}
            <FontAwesomeIcon id={"diamond"} icon={faStar} title={`Diamond`} />{" "}
            <FontAwesomeIcon id={"diamond"} icon={faStar} title={`Diamond`} />
          </div>
        ) : (
          <div>
            <FontAwesomeIcon
              id={attempt >= 5 ? "complete" : "incomplete"}
              icon={faStar}
              title={` One Star 5 points`}
            />{" "}
            <FontAwesomeIcon
              id={attempt >= 15 ? "complete" : "incomplete"}
              icon={faStar}
              title={`Two Star 15 points`}
            />{" "}
            <FontAwesomeIcon
              id={attempt >= 25 ? "complete" : "incomplete"}
              icon={faStar}
              title={`Three Star 25 points`}
            />
          </div>
        )}
      </span>
      <div
        className={`cal-month ${props.mini && "cal-month-mini"}`}
        data-index={props.num}
      >
        {calendarData &&
          calendarData.map((e, i) => (
            <div
              key={i}
              data-index={i}
              className={`cal-week ${props.mini && "cal-week-mini"}`}
            >
              {e.map((x, i) => (
                <div
                  key={i}
                  data-index={i}
                  id={x.date}
                  className={`cal-day ${x.date == 0 ? "hidden" : ""} ${
                    x.date === todaysDate && props.month === todaysMonth
                      ? "active"
                      : ""
                  }
                  ${props.mini && "cal-day-mini"}`}
                  style={{ backgroundColor: x.colorCode }}
                  onClick={(e) =>
                    handleOpen(
                      monthStringName,
                      x.date,
                      todaysYear,
                      e.target.parentElement.getAttribute("data-index"),
                      i
                    )
                  }
                >
                  {x.date}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
