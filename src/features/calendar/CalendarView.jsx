import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
  subDays,
  parseISO,
  addYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, Plus, Award, Clock, Trash2, Edit2, Calendar, Repeat } from "lucide-react";
import { employeeService } from "../../services/employeeService";
import { calendarService } from "../../services/calendarService";
import { SkeletonCalendar, SkeletonEventCard, Skeleton } from "../../components/common/Skeleton";
import AddEventModal from "./AddEventModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import MiniCalendar from "./MiniCalendar";
import EventPopover from "./EventPopover";
import "./calendar-styles.css";

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [miniCalMonth, setMiniCalMonth] = useState(new Date());
  const [view, setView] = useState("month"); // "month", "week", "day"
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Popover state
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);

  // Generate recurring event instances for a given date range
  const generateRecurringInstances = (event, startRange, endRange) => {
    const instances = [];
    const eventDate = new Date(event.date);
    const recurrence = event.recurrence;

    if (!recurrence || recurrence === "none") {
      return [event];
    }

    let currentDate = new Date(eventDate);
    const maxIterations = 365; // Limit to prevent infinite loops
    let iterations = 0;

    while (currentDate <= endRange && iterations < maxIterations) {
      if (currentDate >= startRange) {
        instances.push({
          ...event,
          date: new Date(currentDate),
          originalEventId: event.id,
          isRecurringInstance: iterations > 0,
        });
      }

      switch (recurrence) {
        case "daily":
          currentDate = addDays(currentDate, 1);
          break;
        case "weekly":
          currentDate = addDays(currentDate, 7);
          break;
        case "monthly":
          currentDate = addMonths(currentDate, 1);
          break;
        case "yearly":
          currentDate = addYears(currentDate, 1);
          break;
        default:
          return instances;
      }
      iterations++;
    }

    return instances;
  };

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch employees for anniversaries
      const { data: employees } = await employeeService.getAll();

      // Fetch calendar events
      const { data: calendarEvents } = await calendarService.getAll();

      let allEvents = [];

      // Define date range for recurring events (current month ± 2 months)
      const rangeStart = subMonths(startOfMonth(currentMonth), 1);
      const rangeEnd = addMonths(endOfMonth(currentMonth), 1);

      // Process Anniversaries
      if (employees) {
        const currentYear = currentMonth.getFullYear();
        const anniversaryEvents = employees.map(emp => {
          if (!emp.join_date) return null;

          const joinDate = new Date(emp.join_date);
          const anniversaryDate = new Date(currentYear, joinDate.getMonth(), joinDate.getDate());
          const years = currentYear - joinDate.getFullYear();

          if (years <= 0) return null;

          return {
            id: `anniversary-${emp.id}`,
            title: `${emp.name}'s ${years}${getOrdinal(years)} Work Anniversary`,
            date: anniversaryDate,
            time: "All Day",
            type: "anniversary",
            colorClass: "event-client",
            location: "Office Celebration",
            isAnniversary: true
          };
        }).filter(Boolean);
        allEvents = [...allEvents, ...anniversaryEvents];
      }

      // Process Calendar Events with recurring instances
      if (calendarEvents) {
        calendarEvents.forEach(evt => {
          const formattedEvent = {
            ...evt,
            date: parseISO(evt.date),
            endTime: evt.end_time,
            isAllDay: evt.is_all_day,
            colorClass: getEventColorClass(evt.type),
            isAnniversary: false
          };

          const instances = generateRecurringInstances(formattedEvent, rangeStart, rangeEnd);
          allEvents = [...allEvents, ...instances];
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const getEventColorClass = (type) => {
    switch (type) {
      case "meeting": return "event-meeting";
      case "holiday": return "event-holiday";
      case "deadline": return "event-deadline";
      case "event":
      case "personal":
      default: return "event-personal";
    }
  };

  const next = () => {
    if (view === "month") setCurrentMonth(addMonths(currentMonth, 1));
    else if (view === "week") setCurrentMonth(addWeeks(currentMonth, 1));
    else if (view === "day") setCurrentMonth(addDays(currentMonth, 1));
  };

  const prev = () => {
    if (view === "month") setCurrentMonth(subMonths(currentMonth, 1));
    else if (view === "week") setCurrentMonth(subWeeks(currentMonth, 1));
    else if (view === "day") setCurrentMonth(subDays(currentMonth, 1));
  };

  const onDateClick = (day) => {
    setSelectedDate(day);
    setMiniCalMonth(day);
  };

  const handleMiniCalDateSelect = (day) => {
    setSelectedDate(day);
    setCurrentMonth(day);
  };

  const handleAddEvent = (date = null) => {
    if (date) setSelectedDate(date);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    // For recurring instances, edit the original event
    const eventToEdit = event.isRecurringInstance
      ? { ...event, id: event.originalEventId }
      : event;
    setEditingEvent(eventToEdit);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (event) => {
    // For recurring instances, delete the original event
    const eventToDeleteData = event.isRecurringInstance
      ? { ...event, id: event.originalEventId }
      : event;
    setEventToDelete(eventToDeleteData);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEvent = async (formData) => {
    setIsLoading(true);
    try {
      if (editingEvent) {
        await calendarService.update(editingEvent.id, formData);
      } else {
        await calendarService.create(formData);
      }
      await fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsLoading(true);
    try {
      await calendarService.delete(eventToDelete.id);
      await fetchEvents();
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setPopoverEvent(event);
    setPopoverAnchor(e.currentTarget);
    setIsPopoverVisible(true);
  };

  const closePopover = () => {
    setIsPopoverVisible(false);
    setPopoverEvent(null);
    setPopoverAnchor(null);
  };

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <div className="calendar-header-title">
          <h2 className="flex items-center gap-2">
            <Calendar size={28} className="text-primary" />
            {view === "month" && format(currentMonth, "MMMM yyyy")}
            {view === "week" && `Week of ${format(startOfWeek(currentMonth), "MMM d, yyyy")}`}
            {view === "day" && format(currentMonth, "MMMM d, yyyy")}
          </h2>
          <p>Manage your schedule and events</p>
        </div>
        <div className="calendar-header-actions">
          <div className="calendar-nav">
            <button
              type="button"
              onClick={prev}
              className="calendar-nav-button"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date())}
              className="calendar-nav-today"
            >
              Today
            </button>
            <button
              type="button"
              onClick={next}
              className="calendar-nav-button"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="view-switcher">
            <button
              className={`view-switcher-btn ${view === "month" ? "active" : ""}`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`view-switcher-btn ${view === "week" ? "active" : ""}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`view-switcher-btn ${view === "day" ? "active" : ""}`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleAddEvent(new Date())}
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="calendar-weekday">
          {format(addDays(startDate, i), dateFormat)}
        </div>,
      );
    }
    return <div className="calendar-weekdays">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const cells = [];
    let day = startDate;

    while (day <= endDate) {
      const formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const today = isToday(day);

      const dayClasses = [
        "calendar-day",
        !isCurrentMonth && "not-current-month",
        isSelected && "selected",
        today && "today",
      ]
        .filter(Boolean)
        .join(" ");

      cells.push(
        <div
          key={cloneDay.toISOString()}
          role="button"
          tabIndex={0}
          onClick={() => onDateClick(cloneDay)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onDateClick(cloneDay);
            }
          }}
          className={dayClasses}
          aria-pressed={isSelected}
        >
          <div className="calendar-day-header">
            <span className="calendar-day-number">{formattedDate}</span>
            {dayEvents.length > 0 && (
              <span className="calendar-day-event-count">
                {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
              </span>
            )}
          </div>

          <div className="calendar-day-events">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id + (event.isRecurringInstance ? `-${event.date.toISOString()}` : "")}
                className={`calendar-event ${event.colorClass}`}
                title={event.title}
                onClick={(e) => handleEventClick(event, e)}
              >
                <span className="calendar-event-content">
                  {event.recurrence && event.recurrence !== "none" && (
                    <Repeat size={10} className="calendar-event-recurring-icon" />
                  )}
                  {event.time && event.time !== "All Day" ? event.time.substring(0, 5) : ""} {event.title}
                </span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="calendar-more-events">
                + {dayEvents.length - 3} more
              </div>
            )}
          </div>

          <button
            type="button"
            className="calendar-day-add-button"
            aria-label={`Add event on ${format(cloneDay, 'MMMM d')}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddEvent(cloneDay);
            }}
          >
            <Plus size={14} />
          </button>
        </div>,
      );
      day = addDays(day, 1);
    }

    return <div className="calendar-days">{cells}</div>;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentMonth);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
      const isSelected = isSameDay(day, selectedDate);
      const isTodayDate = isToday(day);

      days.push(
        <div
          key={day.toISOString()}
          className={`calendar-week-day ${isSelected ? "selected" : ""} ${isTodayDate ? "today" : ""}`}
          onClick={() => onDateClick(day)}
        >
          <div className="calendar-week-header">
            <span className="week-day-name">{format(day, "EEE")}</span>
            <span className="week-day-number">{format(day, "d")}</span>
          </div>
          <div className="calendar-week-events">
            {dayEvents.map(event => (
              <div
                key={event.id + (event.isRecurringInstance ? `-${event.date.toISOString()}` : "")}
                className={`calendar-event ${event.colorClass}`}
                onClick={(e) => handleEventClick(event, e)}
              >
                <div className="calendar-event-week-content">
                  <span className="calendar-event-title">{event.title}</span>
                  {event.time && (
                    <span className="calendar-event-time-badge">
                      {event.time === "All Day" ? "All Day" : event.time}
                    </span>
                  )}
                  {event.recurrence && event.recurrence !== "none" && (
                    <Repeat size={10} className="calendar-event-recurring-icon" />
                  )}
                </div>
              </div>
            ))}
            <button
              className="add-event-week-btn"
              aria-label={`Add event on ${format(day, 'MMMM d')}`}
              onClick={(e) => {
                e.stopPropagation();
                handleAddEvent(day);
              }}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      );
    }

    return <div className="calendar-week-view">{days}</div>;
  };

  const renderDayView = () => {
    const day = currentMonth;
    const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));

    // Generate time slots from 8 AM to 8 PM
    const timeSlots = [];
    for (let i = 8; i <= 20; i++) {
      timeSlots.push(i);
    }

    return (
      <div className="calendar-day-view">
        <div className="day-view-header">
          <div className="day-view-date">
            <span className="day-view-date-num">{format(day, "d")}</span>
            <div className="day-view-date-info">
              <span className="day-view-day-name">{format(day, "EEEE")}</span>
              <span className="day-view-month-year">{format(day, "MMMM yyyy")}</span>
            </div>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => handleAddEvent(day)}
          >
            <Plus size={16} /> Add Event
          </button>
        </div>

        <div className="day-view-timeline">
          {timeSlots.map(hour => {
            const hourEvents = dayEvents.filter(e => {
              if (!e.time || e.time === "All Day") return false;
              const [h] = e.time.split(':');
              return parseInt(h) === hour;
            });

            return (
              <div key={hour} className="day-view-hour">
                <div className="day-view-time">{hour}:00</div>
                <div className="day-view-content">
                  {hourEvents.map(event => (
                    <div
                      key={event.id + (event.isRecurringInstance ? `-${event.date.toISOString()}` : "")}
                      className={`day-event-card ${event.colorClass}`}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <div className="day-event-title">{event.title}</div>
                      <div className="day-event-meta">
                        <span>{event.time}{event.endTime ? ` - ${event.endTime}` : ""}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        {event.recurrence && event.recurrence !== "none" && (
                          <Repeat size={12} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* All day events */}
          <div className="day-view-hour">
            <div className="day-view-time">All Day</div>
            <div className="day-view-content">
              {dayEvents.filter(e => !e.time || e.time === "All Day").map(event => (
                <div
                  key={event.id + (event.isRecurringInstance ? `-${event.date.toISOString()}` : "")}
                  className={`day-event-card ${event.colorClass}`}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <div className="day-event-title">{event.title}</div>
                  <div className="day-event-meta">
                    <span>All Day</span>
                    {event.recurrence && event.recurrence !== "none" && (
                      <Repeat size={12} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    const selectedDayEvents = events.filter((e) =>
      isSameDay(new Date(e.date), selectedDate),
    );

    return (
      <div className="calendar-sidebar">
        {/* Mini Calendar Widget */}
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={handleMiniCalDateSelect}
          currentMonth={miniCalMonth}
          onMonthChange={setMiniCalMonth}
          events={events}
        />

        <div className="calendar-sidebar-header">
          <h3>{format(selectedDate, "EEEE, MMMM do")}</h3>
          <p>{selectedDayEvents.length} {selectedDayEvents.length === 1 ? "event" : "events"} scheduled</p>
        </div>

        <div className="calendar-sidebar-events">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((event) => (
              <div key={event.id + (event.isRecurringInstance ? `-${event.date.toISOString()}` : "")} className="calendar-event-card group relative">
                <div className="calendar-event-time">
                  <Clock size={14} className="inline mr-1" />
                  {event.time}
                  {event.endTime && ` - ${event.endTime}`}
                </div>
                <div className={`calendar-event-details ${event.colorClass}`}>
                  <div>
                    <h4 className="calendar-event-card-title">
                      {event.title}
                      {event.recurrence && event.recurrence !== "none" && (
                        <Repeat size={12} className="inline ml-2 opacity-60" />
                      )}
                    </h4>
                    <div className="calendar-event-location mt-1">
                      {event.isAnniversary ? <Award size={12} /> : <MapPin size={12} />}
                      <span>{event.location || "No location"}</span>
                    </div>
                    {event.description && (
                      <p className="calendar-event-description">{event.description}</p>
                    )}
                  </div>
                </div>

                {!event.isAnniversary && (
                  <div className="calendar-event-actions">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="calendar-event-action-btn edit"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(event)}
                      className="calendar-event-action-btn delete"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="calendar-empty-state">
              <p>No events scheduled</p>
              <button type="button" onClick={() => handleAddEvent(selectedDate)}>+ Add Event</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading && !events.length) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="card">
          <div className="calendar-header">
            <div className="calendar-header-title">
              <Skeleton width="200px" height="32px" />
              <Skeleton width="220px" height="14px" />
            </div>
            <div className="calendar-header-actions">
              <div style={{ display: 'flex', gap: '8px' }}>
                <Skeleton width="36px" height="36px" borderRadius="8px" />
                <Skeleton width="60px" height="36px" borderRadius="8px" />
                <Skeleton width="36px" height="36px" borderRadius="8px" />
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Skeleton width="60px" height="32px" borderRadius="6px" />
                <Skeleton width="60px" height="32px" borderRadius="6px" />
                <Skeleton width="60px" height="32px" borderRadius="6px" />
              </div>
              <Skeleton width="100px" height="40px" borderRadius="8px" />
            </div>
          </div>
        </div>

        <div className="calendar-layout">
          {/* Calendar Grid Skeleton */}
          <div className="card p-6">
            <SkeletonCalendar />
          </div>

          {/* Sidebar Skeleton */}
          <div className="card p-6">
            <Skeleton width="180px" height="20px" />
            <Skeleton width="100px" height="14px" className="mt-2" />
            <div className="skeleton-stagger" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonEventCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">{renderHeader()}</div>
      <div className="calendar-layout">
        <div className="card p-0">
          <div className="calendar-grid-wrapper">
            <div className="calendar-grid-container">
              {view === "month" && (
                <>
                  {renderDays()}
                  {renderCells()}
                </>
              )}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
            </div>
          </div>
        </div>
        <div className="card p-8">{renderSidebar()}</div>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
        eventToEdit={editingEvent}
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"?${eventToDelete?.recurrence && eventToDelete?.recurrence !== "none" ? " This will delete all recurring instances." : ""} This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isLoading}
      />

      <EventPopover
        event={popoverEvent}
        anchorEl={popoverAnchor}
        isVisible={isPopoverVisible}
        onClose={closePopover}
        onEdit={handleEditEvent}
        onDelete={handleDeleteClick}
      />
    </div>
  );
};

export default CalendarView;

