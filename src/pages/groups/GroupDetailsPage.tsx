import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Alert, Box, Button, useMediaQuery, useTheme } from "@mui/material";

import { useAppState } from "../../app/AppStateContext";
import type { GroupExpense } from "../../shared/api/backend";
import { GroupDebtWidget } from "../../widgets/module/group/GroupDebtWidget";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { ExpenseViewDialog } from "./ExpenseViewDialog";
import { GroupDetailsHeader } from "./GroupDetailsHeader";
import { GroupMembersDialog } from "./GroupMembersDialog";
import { GroupQuickStats } from "./GroupQuickStats";
import { RecentExpensesCard } from "./RecentExpensesCard";
import { useExpenseDraft } from "./useExpenseDraft";
import { useGroupDetailsData } from "./useGroupDetailsData";

export function GroupDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { backendUrl, currentUser, session } = useAppState();
  const theme = useTheme();
  const isPhoneScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<GroupExpense | null>(null);

  const {
    group,
    members,
    setDebtBoard,
    isLoading,
    errorMessage,
    setErrorMessage,
    expenses,
    expensesData,
    totalExpensesCount,
    expensesPageNum,
    setExpensesPageNum,
    isExpensesLoading,
    youOwe,
    owedToYou,
    refreshAfterExpenseCreated,
  } = useGroupDetailsData(id);

  const {
    showExpenseDialog,
    setShowExpenseDialog,
    expenseData,
    setExpenseData,
    previewShares,
    previewMembers,
    equalSplitHasRemainder,
    openExpenseDialog,
    setPaidBy,
    setSplitType,
    toggleParticipant,
    setParticipantShare,
    handleCreateExpense,
  } = useExpenseDraft({
    id,
    backendUrl,
    currentUser,
    accessToken: session?.accessToken,
    members,
    setErrorMessage,
    onExpenseCreated: refreshAfterExpenseCreated,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <GroupDetailsHeader
        isLoading={isLoading}
        group={group}
        members={members}
        backendUrl={backendUrl}
        accessToken={session?.accessToken}
        onBack={() => navigate("/groups")}
        onOpenSettings={() => navigate(`/groups/${id}/settings`)}
        onShowMembers={() => setShowMembersDialog(true)}
      />

      <GroupQuickStats youOwe={youOwe} owedToYou={owedToYou} />

      <Button
        startIcon={<Plus size={18} strokeWidth={2} />}
        onClick={openExpenseDialog}
        fullWidth
        sx={{
          bgcolor: "var(--color-accent)",
          color: "var(--color-accent-contrast)",
          p: 1.5,
          fontWeight: 700,
          textTransform: "none",
          fontSize: "1rem",
          "&:hover": {
            bgcolor: "var(--color-accent)",
            filter: "brightness(0.92)",
          },
        }}
      >
        Add Expense
      </Button>

      <GroupDebtWidget
        backendUrl={backendUrl}
        groupId={id || ""}
        currentUserId={currentUser?.id}
        accessToken={session?.accessToken}
        onBoardChange={setDebtBoard}
      />

      <RecentExpensesCard
        expensesExpanded={expensesExpanded}
        onToggleExpanded={() => setExpensesExpanded((current) => !current)}
        totalExpensesCount={totalExpensesCount}
        isExpensesLoading={isExpensesLoading}
        expenses={expenses}
        expensesData={expensesData}
        expensesPageNum={expensesPageNum}
        onPageChange={setExpensesPageNum}
        isPhoneScreen={isPhoneScreen}
        onExpenseClick={setViewingExpense}
      />

      <ExpenseViewDialog
        expense={viewingExpense}
        members={members}
        backendUrl={backendUrl}
        accessToken={session?.accessToken}
        currentUserId={currentUser?.id}
        onClose={() => setViewingExpense(null)}
      />

      <GroupMembersDialog
        open={showMembersDialog}
        onClose={() => setShowMembersDialog(false)}
        members={members}
        backendUrl={backendUrl}
        accessToken={session?.accessToken}
        currentUser={currentUser}
      />

      <AddExpenseDialog
        open={showExpenseDialog}
        onClose={() => setShowExpenseDialog(false)}
        isPhoneScreen={isPhoneScreen}
        members={members}
        currentUser={currentUser}
        backendUrl={backendUrl}
        accessToken={session?.accessToken}
        expenseData={expenseData}
        onTitleChange={(title) => setExpenseData((current) => ({ ...current, title }))}
        onAmountChange={(amount) => setExpenseData((current) => ({ ...current, amount }))}
        onPaidByChange={setPaidBy}
        onSplitTypeChange={setSplitType}
        onChargeSameAmountChange={(chargeSameAmount) => setExpenseData((current) => ({ ...current, chargeSameAmount }))}
        onToggleParticipant={toggleParticipant}
        onParticipantShareChange={setParticipantShare}
        onDescriptionChange={(description) => setExpenseData((current) => ({ ...current, description }))}
        previewMembers={previewMembers}
        previewShares={previewShares}
        equalSplitHasRemainder={equalSplitHasRemainder}
        onSubmit={handleCreateExpense}
      />
    </Box>
  );
}
