import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { Clock, MapPin, Calendar, Repeat, Edit2, Trash2, X } from "lucide-react";

const EventPopover = ({
    event,
    anchorEl,
    onClose,
    onEdit,
    onDelete,
    isVisible,
}) => {
    const popoverRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isVisible && anchorEl && popoverRef.current) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = anchorRect.bottom + 8;
            let left = anchorRect.left;

            // Adjust if popover would overflow right edge
            if (left + popoverRect.width > viewportWidth - 20) {
                left = viewportWidth - popoverRect.width - 20;
            }

            // Adjust if popover would overflow bottom edge
            if (top + popoverRect.height > viewportHeight - 20) {
                top = anchorRect.top - popoverRect.height - 8;
            }

            // Ensure minimum left position
            if (left < 20) {
                left = 20;
            }

            setPosition({ top, left });
        }
    }, [isVisible, anchorEl]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorEl?.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isVisible, anchorEl, onClose]);

    if (!isVisible || !event) return null;

    const getRecurrenceLabel = (recurrence) => {
        switch (recurrence) {
            case "daily": return "Repeats daily";
            case "weekly": return "Repeats weekly";
            case "monthly": return "Repeats monthly";
            case "yearly": return "Repeats yearly";
            default: return null;
        }
    };

    const eventTypeColors = {
        meeting: { bg: "var(--primary-light)", border: "var(--primary)", text: "var(--primary)" },
        holiday: { bg: "#ecfdf5", border: "#059669", text: "#059669" },
        deadline: { bg: "#fef2f2", border: "#dc2626", text: "#dc2626" },
        event: { bg: "#f3f4f6", border: "#4b5563", text: "#4b5563" },
        personal: { bg: "#f3f4f6", border: "#4b5563", text: "#4b5563" },
    };

    const colors = eventTypeColors[event.type] || eventTypeColors.event;

    return (
        <div
            ref={popoverRef}
            className="event-popover"
            style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                zIndex: 9999,
            }}
        >
            <div className="event-popover-header" style={{ borderLeftColor: colors.border }}>
                <div className="event-popover-type" style={{ background: colors.bg, color: colors.text }}>
                    {event.type || "Event"}
                </div>
                <button
                    type="button"
                    className="event-popover-close"
                    onClick={onClose}
                    aria-label="Close popover"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="event-popover-content">
                <h4 className="event-popover-title">{event.title}</h4>

                <div className="event-popover-meta">
                    <div className="event-popover-meta-item">
                        <Calendar size={14} />
                        <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                    </div>

                    {event.time && event.time !== "All Day" && (
                        <div className="event-popover-meta-item">
                            <Clock size={14} />
                            <span>{event.time}{event.endTime ? ` - ${event.endTime}` : ""}</span>
                        </div>
                    )}

                    {event.time === "All Day" && (
                        <div className="event-popover-meta-item">
                            <Clock size={14} />
                            <span>All Day</span>
                        </div>
                    )}

                    {event.location && (
                        <div className="event-popover-meta-item">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                        </div>
                    )}

                    {event.recurrence && event.recurrence !== "none" && (
                        <div className="event-popover-meta-item recurrence">
                            <Repeat size={14} />
                            <span>{getRecurrenceLabel(event.recurrence)}</span>
                        </div>
                    )}
                </div>

                {event.description && (
                    <p className="event-popover-description">{event.description}</p>
                )}
            </div>

            {!event.isAnniversary && (
                <div className="event-popover-actions">
                    <button
                        type="button"
                        className="event-popover-btn edit"
                        onClick={() => {
                            onEdit(event);
                            onClose();
                        }}
                    >
                        <Edit2 size={14} />
                        <span>Edit</span>
                    </button>
                    <button
                        type="button"
                        className="event-popover-btn delete"
                        onClick={() => {
                            onDelete(event);
                            onClose();
                        }}
                    >
                        <Trash2 size={14} />
                        <span>Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
};

EventPopover.propTypes = {
    event: PropTypes.object,
    anchorEl: PropTypes.any,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
};

export default EventPopover;
