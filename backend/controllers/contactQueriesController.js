import moonlightContactQueries from "../models/contactQueries.js";
import { StatusCodes } from "http-status-codes";
import ExcelJS from "exceljs";
import { getPaginationParams, getPaginationInfo } from "../utils/pagination.js";

export const createContactQuery = async (req, res) => {
  try {
    const contact = await moonlightContactQueries.create(req.body);
    res.status(StatusCodes.CREATED).json({
      contact,
      status: "success",
      message: "Success! Contact query created successfully",
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllContactQueries = async (req, res) => {
  try {
    const {
      search,
      startDate,
      endDate,
      sortBy = "newest", 
    } = req.query;

    const queryObject = {};

    // Search filtering
    if (search) {
      queryObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      queryObject.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        queryObject.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryObject.createdAt.$lte = end;
      }
    }

    // Pagination util
    const { page, limit, skip } = getPaginationParams(req);

    // Sorting options
    let sortObject = {};
    switch (sortBy) {
      case "newest":
        sortObject = { createdAt: -1 };
        break;
      case "oldest":
        sortObject = { createdAt: 1 };
        break;
      case "name":
        sortObject = { name: 1 };
        break;
      case "name-desc":
        sortObject = { name: -1 };
        break;
      default:
        sortObject = { createdAt: -1 };
    }

    // Parallel queries for contacts and total count
    const [contacts, totalDocs] = await Promise.all([
      moonlightContactQueries.find(queryObject)
        .limit(limit)
        .skip(skip)
        .sort(sortObject)
        .lean(),
      moonlightContactQueries.countDocuments(queryObject),
    ]);

    // Pagination info util
    const pagination = getPaginationInfo(totalDocs, page, limit);

    res.status(StatusCodes.OK).json({
      status: "success",
      contacts,
      ...pagination,
      filters: {
        search,
        startDate,
        endDate,
        sortBy,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

export const exportContactQueries = async (req, res) => {
  try {
    const { format = "xlsx", search, sortBy, startDate, endDate } = req.query;

    const queryObject = {};

    if (search) {
      queryObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      queryObject.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        queryObject.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryObject.createdAt.$lte = end;
      }
    }

    let sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "name-desc":
        sortOptions = { name: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const contacts = await moonlightContactQueries.find(queryObject)
      .sort(sortOptions)
      .lean();

    if (contacts.length === 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "No contacts found matching the criteria",
      });
    }

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Contacts");

      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Phone Number", key: "phoneNumber", width: 30 },
        { header: "Message", key: "message", width: 40 },
        { header: "Created At", key: "createdAt", width: 20 },
        { header: "Updated At", key: "updatedAt", width: 20 },
      ];

      contacts.forEach(contact => {
        worksheet.addRow({
          name: contact.name || "",
          phoneNumber: contact.phoneNumber || "",
          message: contact.message || "",
          createdAt: contact.createdAt ? new Date(contact.createdAt).toLocaleString() : "",
          updatedAt: contact.updatedAt ? new Date(contact.updatedAt).toLocaleString() : "",
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };

      worksheet.columns.forEach(column => {
        if (column.width < 10) column.width = 10;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="contacts-${new Date().toISOString().split("T")[0]}.xlsx"`
      );
      res.setHeader("Content-Length", buffer.length);

      return res.send(buffer);
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Unsupported export format. Only xlsx is supported.",
      });
    }
  } catch (error) {
    console.error("Export contacts error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error exporting contacts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteContactQuery = async (req, res) => {
  try {
    const contact = await moonlightContactQueries.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Contact not found" });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Contact deleted successfully"
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

export const addBulkContactQuery = async (req, res) => {
  try {
    const contacts = await moonlightContactQueries.insertMany(req.body);
    res.status(StatusCodes.CREATED).json({
      contacts,
      status: "success",
      message: "Success! Contacts added successfully",
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message: error.message,
    });
  }
};
