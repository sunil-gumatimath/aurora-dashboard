import React from "react";
import PropTypes from "prop-types";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MiniCalendar = ({
    selectedDate,
    onDateSelect,
    currentMonth,
    onMonthChange,
    events = [],
}) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const renderDays = () => {
        const days = [];
        const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

        return (
            <div className="mini-cal-weekdays">
                {weekdays.map((day) => (
                    <div key={day} className="mini-cal-weekday">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const cells = [];
        let day = startDate;

        while (day <= endDate) {
            const cloneDay = day;
            const hasEvents = events.some((e) => isSameDay(new Date(e.date), day));
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            const dayClasses = [
                "mini-cal-day",
                !isCurrentMonth && "other-month",
                isSelected && "selected",
                isTodayDate && "today",
                hasEvents && "has-events",
            ]
                .filter(Boolean)
                .join(" ");

            cells.push(
                <button
                    key={day.toISOString()}
                    type="button"
                    className={dayClasses}
                    onClick={() => onDateSelect(cloneDay)}
                    aria-label={format(day, "MMMM d, yyyy")}
                    aria-pressed={isSelected}
                >
                    <span className="mini-cal-day-number">{format(day, "d")}</span>
                    {hasEvents && <span className="mini-cal-event-dot" />}
                </button>
            );
            day = addDays(day, 1);
        }

        return <div className="mini-cal-days">{cells}</div>;
    };

    return (
        <div className="mini-calendar">
            <div className="mini-cal-header">
                <button
                    type="button"
                    className="mini-cal-nav-btn"
                    onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="mini-cal-month-title">
                    {format(currentMonth, "MMM yyyy")}
                </span>
                <button
                    type="button"
                    className="mini-cal-nav-btn"
                    onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            {renderDays()}
            {renderCells()}
        </div>
    );
};

MiniCalendar.propTypes = {
    selectedDate: PropTypes.instanceOf(Date).isRequired,
    onDateSelect: PropTypes.func.isRequired,
    currentMonth: PropTypes.instanceOf(Date).isRequired,
    onMonthChange: PropTypes.func.isRequired,
    events: PropTypes.array,
};

export default MiniCalendar;
