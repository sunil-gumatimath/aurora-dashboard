import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Calendar, Clock, MapPin, Type, AlignLeft, Repeat, Sun } from "lucide-react";

const AddEventModal = ({
    isOpen,
    onClose,
    onSave,
    initialDate,
    eventToEdit = null,
    isLoading = false,
}) => {
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        endTime: "",
        type: "event",
        location: "",
        description: "",
        isAllDay: false,
        recurrence: "none",
    });

    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                setFormData({
                    title: eventToEdit.title || "",
                    date: eventToEdit.date ? new Date(eventToEdit.date).toLocaleDateString("en-CA") : "",
                    time: eventToEdit.time === "All Day" ? "" : (eventToEdit.time || ""),
                    endTime: eventToEdit.endTime || "",
                    type: eventToEdit.type || "event",
                    location: eventToEdit.location || "",
                    description: eventToEdit.description || "",
                    isAllDay: eventToEdit.time === "All Day" || eventToEdit.isAllDay || false,
                    recurrence: eventToEdit.recurrence || "none",
                });
            } else {
                const dateToUse = initialDate || new Date();
                setFormData({
                    title: "",
                    date: dateToUse.toLocaleDateString("en-CA"),
                    time: "",
                    endTime: "",
                    type: "event",
                    location: "",
                    description: "",
                    isAllDay: false,
                    recurrence: "none",
                });
            }
        }
    }, [isOpen, initialDate, eventToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            time: formData.isAllDay ? "All Day" : formData.time,
        };
        onSave(submitData);
    };

    if (!isOpen) return null;

    const recurrenceOptions = [
        { value: "none", label: "Does not repeat" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content max-w-lg w-full animate-scale-in bg-white rounded-lg shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Window Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {eventToEdit ? "Edit Event" : "Create Event"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Window Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Event Name</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Type size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="form-input !pl-9 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                    placeholder="Enter event name..."
                                />
                            </div>
                        </div>

                        {/* All Day Toggle */}
                        <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Sun size={18} className="text-amber-500" />
                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    name="isAllDay"
                                    checked={formData.isAllDay}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">All-day event</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Calendar size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="form-input !pl-9 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="form-select w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                >
                                    <option value="event">Event</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="holiday">Holiday</option>
                                    <option value="deadline">Deadline</option>
                                </select>
                            </div>
                        </div>

                        {/* Time Fields - Hidden when All Day is selected */}
                        {!formData.isAllDay && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Clock size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className="form-input !pl-9 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Clock size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="form-input !pl-9 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recurrence */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Repeat</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Repeat size={16} className="text-gray-400" />
                                </div>
                                <select
                                    name="recurrence"
                                    value={formData.recurrence}
                                    onChange={handleChange}
                                    className="form-select !pl-9 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                >
                                    {recurrenceOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <MapPin size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-input !pl-9 w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm"
                                    placeholder="Add location"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 pointer-events-none">
                                    <AlignLeft size={16} className="text-gray-400" />
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="form-textarea !pl-9 w-full min-h-[80px] py-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md text-sm resize-none"
                                    placeholder="Add description..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Window Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-w-[80px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="min-w-[80px] px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddEventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    initialDate: PropTypes.instanceOf(Date),
    eventToEdit: PropTypes.object,
    isLoading: PropTypes.bool,
};

export default AddEventModal;
